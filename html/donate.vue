<script>
import { Address } from './components.vue';
// const components = require('./components.vue');
// const Address = components.Address;
// console.log(Address);

export default {
  name: 'Donate',
  components: {
    Address,
  }
}
</script>

<template>
  <div>
    <p>
      <small>Free software authors, scientists/inventors, and science/software publishers:</small>
      <a href="#/register">Register for a salary.</a>
      <br>
      <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
    </p>
    <h1>Donate / Bequest</h1>
    <p>
      This is <strong>the</strong> donation app. Don't use KickStarter/GoFundMe anymore,
      <em>donate or bequest</em>
      here for the software and the free market to choose the best donation recepient.
    </p>
    <p style="color: red">
      This is demo version for a testnet. Contracts are not audited yet.
    </p>
    <p>
      Donate for:
      <label>
        <input
          type="radio"
          name="donateFor"
          onclick="setDonateFor('science')"
        >
        &nbsp;Science and free software
      </label>
      <label>
        <input
          type="radio"
          name="donateFor"
          onclick="setDonateFor('climate')"
        >
        &nbsp;Climate
      </label>
    </p>
    <p>
      <label>
        <input
          type="radio"
          name="paymentKind"
          onclick="setPaymentKind('donate')"
          checked=""
        >
        &nbsp;Donate a sum
      </label>
      <label>
        <input
          type="radio"
          name="paymentKind"
          onclick="setPaymentKind('bequestTokens')"
          checked=""
        >
        &nbsp;Donate but allow me to take money back
      </label>
      <label>
        <input
          type="radio"
          name="paymentKind"
          onclick="setPaymentKind('bequestGnosis')"
          checked=""
        >
        &nbsp;Bequest all funds on a Gnosis Safe smart wallet
      </label>
    </p>
    <p style="">
      Donation in:
      <label>
        <input
          type="radio"
          name="tokenKind"
          onclick="setTokenKind('erc1155')"
        >
        &nbsp;ERC-1155
      </label>
      <small>(recommended)</small>
      <label>
        <input
          type="radio"
          name="tokenKind"
          onclick="setTokenKind('erc20')"
        >
        &nbsp;ERC-20
      </label>
      <br>
      <small>(Don't use stablecoins for long-time funding.)</small>
    </p>
    <p>
      <span style="">Wallet address:</span>
      <span style="">Token address:</span>
      <Address
        value=""
        onchange="await setTokenAddress(event.target.value)"/>
    </p>
    <p style="">
      Token ID:
      <Uint256 value="" onchange="await setTokenId(event.target.value)"/>
    </p>
    <p style="">
      <span style="">
        The donation can be taken back before:
      </span>
      <span style="">
        The bequest can be taken after:
      </span>
      <span style=""></span>
      <span style="">
        <br/>
        <span style="display: inline-block">
          <Calendar onchange="setBequestDate(e)" value="" minDate=""/>
        </span>
      </span>
    </p>
    <div style="">
      <p>
        Donation amount:
        <Amount value="" onchange="await setAmount(event.target.value)"/>
        <button onclick="" disabled="">Donate</button>
      </p>
    </div>
    <p style="">
      <button className="donateButton" disabled="" onclick="bequestAll()">Bequest!</button>
    </p>
  </div>
</template>
