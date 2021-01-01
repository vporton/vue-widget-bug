import React, { useState, useEffect } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Web3 from 'web3';
import erc1155Abi from './ERC1155Abi';
import erc20Abi from './ERC20Abi';
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
const { toBN, toWei } = Web3.utils;

// TODO
const CHAINS: { [id: string] : string } = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '5': 'goerli',
  '42': 'kovan',
  '1337': 'local',
  '122': 'fuse',
  '80001': 'mumbai',
  '137': 'matic',
  '99': 'core',
  '77': 'sokol',
  '100': 'xdai',
  '74': 'idchain',
  '56': 'bsc',
  '97': 'bsctest',
}

let _web3Provider: any = null;

async function baseGetWeb3() {
  if ((window as any).web3 && (window as any).web3.chainId) return (window as any).web3;

  _web3Provider = Web3.givenProvider; //await getWeb3Provider();
  return (window as any).web3 = _web3Provider ? new Web3(_web3Provider) : null;
}

async function getChainId(): Promise<any> { // TODO: more specific type
  const web3 = await baseGetWeb3();
  if (!web3) {
    return null;
  }
  return await (web3 as any).eth.getChainId();
}

function isUint256Valid(v: string): boolean { // TODO: called twice
  return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(256)));
}

function isRealNumber(v: string): boolean { // TODO: called twice
  return /^[0-9]+(\.[0-9]+)?$/.test(v);
}

let _fetchedJsonPromises = new Map<string, Promise<any>>();
let _fetched = new Map<string, any>();

async function fetchOnceJsonPromise(url: string): Promise<Promise<any>> {
  let promise = _fetchedJsonPromises.get(url);
  if (promise) {
    return promise;
  } else {
    const fetchResult = await fetch(url);
    promise = fetchResult.json() as Promise<any>;
    _fetchedJsonPromises.set(url, promise);
    return await promise;
  }
}

async function fetchOnceJson(url: string): Promise<any> {
  let json = _fetched.get(url);
  if (json) {
    return json;
  } else {
    json = await fetchOnceJsonPromise(url);
    _fetched.set(url, json);
    return json;
  }
}

function DonationsComponent() {
  const [oracleId, setOracleId] = useState('0'); // FIXME

  useEffect(() => {
    // FIXME: It should not be done when using this as a component.
    document.title = "Future Software/Science Salaries + Donate/Bequest for Science and Climate";
    setOracleId('0'); // FIXME
  }, []);
 
  async function getWeb3() {
    try {
      (window as any).ethereum.enable().catch(() => {}); // Without this catch Firefox 84.0 crashes on user pressing Cancel.
    }
    catch(_) { }
    const web3 = await baseGetWeb3();
    getAccounts().then((/*accounts*/) => {
      // setConnectedToAccount(accounts.length !== 0); // TODO
    });
    return web3;
  }

  async function getABIs() {
    return await fetchOnceJson(`abis.json`);
  }

  async function getAddresses() {
    const [json, chainId] = await Promise.all([fetchOnceJson(`addresses.json`), getChainId()]);
    if (!CHAINS[chainId] || !json[CHAINS[chainId]]) {
      alert("The selected blockchain is not supported!");
      return null;
    }
    return json[CHAINS[chainId]];
  }

  async function getAccounts(): Promise<Array<string>> {
    const web3 = await baseGetWeb3();
    return web3 ? (web3 as any).eth.getAccounts() : null;
  }

  // FIXME: returns Promise?
  async function mySend(contract: string, method: any, args: Array<any>, sendArgs: any, handler: any): Promise<any> {
    sendArgs = sendArgs || {}
    const account = (await getAccounts())[0];
    return method.bind(contract)(...args).estimateGas({gas: '1000000', from: account, ...sendArgs})
        .then((estimatedGas: string) => {
            const gas = String(Math.floor(Number(estimatedGas) * 1.15) + 24000);
            if(handler !== null)
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs}, handler);
            else
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs});
        });
  }
  
  function Pay() {
    const [donateFor, setDonateFor] = useState('');
    const [paymentKind, setPaymentKind] = useState('bequestTokens');
    const [tokenKind, setTokenKind] = useState('');
    const [bequestDate, setBequestDate] = useState<Date | null>(null);
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [amount, setAmount] = useState('');

    async function obtainERC1155Token() {
      let collateralContractAddress, collateralTokenId;
      switch(tokenKind) {
        case 'erc1155':
          collateralContractAddress = tokenAddress;
          collateralTokenId = tokenId;
          break;
        case 'erc20':
          collateralContractAddress = (await getAddresses()).ERC1155OverERC20.address;
          collateralTokenId = Web3.utils.toHex(tokenAddress);

          const web3 = await getWeb3();
          // if (web3 === null) return;
          const account = (await getAccounts())[0];
          // if(!account) return;

          // Approve ERC-20 spent
          const erc20 = new (web3 as any).eth.Contract(erc20Abi as any, tokenAddress);
          const allowanceStr = await erc20.methods.allowance(account, collateralContractAddress).call();
          const allowance = toBN(allowanceStr);
          const halfBig = toBN(2).pow(toBN(128));
          if(allowance.lt(halfBig)) {
            const big = toBN(2).pow(toBN(256)).sub(toBN(1));
            const tx = await mySend(erc20, erc20.methods.approve, [collateralContractAddress, big.toString()], {from: account}, null)
              // .catch(e => alert(e.message));
            await tx;
          }
          break;
      }
      return [collateralContractAddress, collateralTokenId];
    }

    async function lockContract() {
      const addresses = await getAddresses();
      switch (donateFor) {
        case 'science':
          return addresses.SalaryWithDAO.address;
        case 'climate':
          return addresses.Lock.address;
        default:
          return '';
      } 
    }

    useEffect(() => {
      async function updateInfo() {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const contractAddress = await lockContract();
          if (contractAddress !== '') {
            const scienceAbi = (await getABIs()).SalaryWithDAO;
            const science = new (web3 as any).eth.Contract(scienceAbi as any, contractAddress);
            const account = (await getAccounts())[0];
            if(!account) {
              // setConnectedToAccount(false); // TODO
              return;
            }
            setBequestDate(new Date(await science.methods.minFinishTime(oracleId).call() * 1000));
          }
        }
      }

      updateInfo();
      // eslint-disable-next-line
    }, [oracleId]);

    async function donate() {
      const wei = toWei(amount);
      const web3 = await getWeb3();
      if (web3 !== null) {
        try {
          const contractAddress = await lockContract();
          const scienceAbi = (await getABIs()).SalaryWithDAO;
          const science = new (web3 as any).eth.Contract(scienceAbi as any, contractAddress);
          const account = (await getAccounts())[0];
          if(!account) {
            // setConnectedToAccount(false); // TODO
            return;
          }
          const [collateralContractAddress, collateralTokenId] = await obtainERC1155Token();
          const collateralContract = new (web3 as any).eth.Contract(erc1155Abi as any, collateralContractAddress);
          const approved = await collateralContract.methods.isApprovedForAll(account, contractAddress).call();
          if (!approved) {
            const tx = await mySend(
              collateralContract, collateralContract.methods.setApprovalForAll,
              [contractAddress, true], {from: account}, null
            );
            await tx;
          }
          switch(paymentKind) {
            case 'donate':
              await mySend(science, science.methods.donate,
                [collateralContractAddress,
                collateralTokenId,
                oracleId,
                wei,
                account,
                account,
                []],
                {from: account}, null
              );
              break;
            case 'bequestTokens':
              await mySend(science, science.methods.bequestCollateral,
                [collateralContractAddress,
                collateralTokenId,
                oracleId,
                wei,
                account,
                []],
                {from: account}, null
              );
              break;
          }
        }
        catch(e) {
          alert(e.message);
        }
      }
    }

    async function bequestAll() {
      alert("Bequesting all funds is not yet supported!");
    }

    function donateButtonDisabled() {
      return !isRealNumber(amount) || donateFor === '' || paymentKind === '' || tokenKind === '' ||
        !isAddressValid(tokenAddress) || (tokenKind === 'erc1155' && !isUint256Valid(tokenId));
    }

    function bequestButtonDisabled() {
      return !isAddressValid(tokenAddress) || bequestDate === null;
    }

    return (
      <header className="App-header">
        <p>
          <small>Free software authors, scientists/inventors, and science/software publishers:</small>
          {' '}
          <NavLink to="/register">Register for a salary.</NavLink>
          <br/>
          <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
        </p>
        <h1>Donate / Bequest</h1>
        <p>This is <strong>the</strong> donation app. Don't use KickStarter/GoFundMe anymore,
          {' '}
          <em>donate or bequest</em>
          {' '}
          here for the software and the free market to choose the best donation recepient.</p>
        <p style={{color: 'red'}}>This is demo version for a testnet. Contracts are not audited yet.</p>
        <p>
          Donate for:
          {' '}
          <label><input type="radio" name="donateFor" onClick={() => setDonateFor('science')}/> Science and free software</label>
          {' '}
          <label><input type="radio" name="donateFor" onClick={() => setDonateFor('climate')}/> Climate</label>
        </p>
        <p>
          <label>
            <input type="radio" name="paymentKind" onClick={() => setPaymentKind('donate')} checked={paymentKind === 'donate'}/>
            {' '}
            Donate a sum
          </label>
          {' '}
          <label>
            <input type="radio" name="paymentKind" onClick={() => setPaymentKind('bequestTokens')} checked={paymentKind === 'bequestTokens'}/>
            {' '}
            Donate but allow me to take money back
          </label>
          {' '}
          <label>
            <input type="radio" name="paymentKind" onClick={() => setPaymentKind('bequestGnosis')} checked={paymentKind === 'bequestGnosis'}/>
            {' '}
            Bequest all funds on a Gnosis Safe smart wallet
          </label>
        </p>
        <p style={{display: paymentKind !== 'bequestGnosis' ? 'block' : 'none'}}>
          Donation in:
          {' '}
          <label><input type="radio" name="tokenKind" onClick={() => setTokenKind('erc1155')}/> ERC-1155</label>
          {' '}
          <small>(recommended)</small>
          {' '}
          <label><input type="radio" name="tokenKind" onClick={() => setTokenKind('erc20')}/> ERC-20</label>
          <br/>
          <small>(Don't use stablecoins for long-time funding.)</small>
        </p>
        <p>
          <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}>Wallet address:</span>
          <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>Token address:</span>
          {' '}
          <Address value={tokenAddress} onChange={async (e: Event) => await setTokenAddress((e.target as HTMLInputElement).value as string)}/>
        </p>
        <p style={{display: paymentKind !== 'bequestGnosis' && tokenKind === 'erc1155' ? 'block' : 'none'}}>
          Token ID:
          {' '}
          <Uint256 value={tokenId} onChange={async (e: Event) => await setTokenId((e.target as HTMLInputElement).value as string)}/>
        </p>
        <p style={{display: paymentKind !== 'donate' ? 'block' : 'none'}}>
          <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>
            The donation can be taken back before:
          </span>
          <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}>
            The bequest can be taken after:
          </span>
          <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>
          {' '}
          {bequestDate !== null ? bequestDate.toString() : ""}</span>
          <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}>
            <br/>
            <span style={{display: 'inline-block'}}>
              <Calendar onChange={(e: any) => setBequestDate(e as Date)} value={bequestDate} minDate={new Date()}/>
            </span>
          </span>
        </p>
        <div style={{display: paymentKind !== 'bequestGnosis' ? 'block' : 'none'}}>
          <p>
            Donation amount:
            {' '}
            <Amount value={amount} onChange={async (e: Event) => await setAmount((e.target as HTMLInputElement).value as string)}/>
            {' '}
            <button onClick={donate} disabled={donateButtonDisabled()}>Donate</button>
          </p>
        </div>
        <p style={{display: paymentKind === 'bequestGnosis' ? 'block' : 'none'}}>
          <button className="donateButton" disabled={bequestButtonDisabled()} onClick={bequestAll}>Bequest!</button>
        </p>
      </header>
    );
  }

  function Register() {
    async function register() {
      const web3 = await getWeb3();
      const account = (await getAccounts())[0];
      if (web3 && account !== null) {
        const addresses = await getAddresses();
        if (!addresses) return;
        const scienceAbi = (await getABIs()).SalaryWithDAO;
        const science = new (web3 as any).eth.Contract(scienceAbi as any, addresses.SalaryWithDAO.address);
        await mySend(science, science.methods.registerCustomer, [oracleId, []], {from: account}, null)
          .catch(e => {
            alert(/You are already registered\./.test(e.message) ? "You are already registered." : e.message);
          });
      }
    }

    return (
      <header className="App-header">
        <p>
          <NavLink to="/">Donate/bequest for science, free software, or climate.</NavLink>
          <br/> 
          <small>Just bequest all your funds here.</small>
        </p>
        <p style={{color: 'red'}}>This is demo version for a testnet. Contracts are not audited yet.</p>
        <p>
          <small>Free software authors, scientists/inventors, and science/software publishers:</small>
        </p>
        <p>
          <button className="donateButton" onClick={register}>Register for a salary</button>
          <br/>
          <small>
            After you have been registered, see TODO to improve your rating.
            <br/>
            Remember, if you publish open source, your rating will tend to improve.
          </small>
        </p>
        <p>
          <small>
            Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.
          </small>
          <br/>
          <small>
            No matter what happens, you will receive 1 token per second since the moment of registration till you die
            (or go inopt for corporations).
            <br/>
            Your salary exchange rate will be "calculated" by free market based on future predictions of your performance,
            {' '}
            such as your expected citations count in the future.
          </small>
        </p>
      </header>
    );
  }

  return (
    <div className="App">
      <HashRouter>
        <Route exact path="/" component={Pay}/>
        <Route path="/register" component={Register}/>
        <p>
          <a rel="noreferrer" target="_blank" href="https://github.com/vporton/donations">
            <img src="img/GitHub-Mark-32px.png" width="32" height="32" alt="Source at GitHub"/>
          </a>
        </p>
      </HashRouter>
    </div>
  );
}

function Address({...props}) {
  return (
    <span className="Address">
      <input type="text"
             maxLength={42}
             size={50}
             value={props.value ? props.value : ""}
             onChange={props.onChange}
             className={isAddressValid(props.value) ? '' : 'error'}/>
    </span>
  )
}

function Uint256({...props}) {
  return (
    <span className="Uint256">
      <input type="text"
             maxLength={78}
             size={92}
             value={props.value}
             onChange={props.onChange}
             className={isUint256Valid(props.value) ? '' : 'error'}/>
    </span>
  )
}

function Amount({...props}  ) {
  return (
    <span className="Amount">
      <input type="text"
             value={props.value ? props.value : ""}
             onChange={props.onChange}
             className={isRealNumber(props.value) ? '' : 'error'}/>
    </span>
  )
}

export const Donations = DonationsComponent;
//export Donations;
