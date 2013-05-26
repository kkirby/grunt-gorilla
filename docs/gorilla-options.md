# Options

## linefeed
Type: `String`
Default: on Windows, `"\r\n"`, otherwise `"\n"`

Compilation will use this to join lines.

## bare
Type: `boolean`

Compile the JavaScript without the top-level function safety wrapper.

## sourceMap
Type: `boolean`
Default: `false`

Compile JavaScript and create a .map file linking it to the GorillaScript source.

## sourceRoot
Type: `string`
Default: `""`

Specify the `sourceRoot` property in the created .map file.
