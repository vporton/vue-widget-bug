# vue-widget-bug

```sh
yarn
yarn test
```

```
$ yarn test
yarn run v1.22.5
warning package.json: No license field
$ eslint --plugin vue html/test.vue

/home/porton/Projects/bugs/vue-widget-bug/html/test.vue
  14:5   warning  '<p>' should have end tag                                                                                                                                                                                            vue/html-end-tags
  14:5   warning  Require self-closing on HTML elements (<p>)                                                                                                                                                                          vue/html-self-closing
  15:1   warning  Expected indentation of 4 spaces but found 6 spaces                                                                                                                                                                  vue/html-indent
  16:1   warning  Expected indentation of 6 spaces but found 8 spaces                                                                                                                                                                  vue/html-indent
  17:1   warning  Expected indentation of 6 spaces but found 8 spaces                                                                                                                                                                  vue/html-indent
  17:61  warning  Expected 1 line break before closing bracket, but no line breaks found                                                                                                                                               vue/html-closing-bracket-newline
  17:61  warning  Expected a space before '/>', but not found                                                                                                                                                                          vue/html-closing-bracket-spacing
  18:5   error    Parsing error: x-invalid-end-tag                                                                                                                                                                                     vue/no-parsing-error
  18:6   error    Parsing error: Unexpected closing tag "p". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags  prettier/prettier

 9 problems (2 errors, 7 warnings)
  0 errors and 7 warnings potentially fixable with the `--fix` option.

error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```
