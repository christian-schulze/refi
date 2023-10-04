# REFI

---

## About

`Refi` is an open source API Documentation Browser for `Linux`, which makes use of [DocSets](https://kapeli.com/docsets)
(with permission) originally used in the [Dash](https://kapeli.com/dash) application for OSX.

## Status

This project is still very much a WIP. You can install DocSets, search for and view results.
However, there is no auto updating of DocSets, no global hotkey activation, or UI configurable settings.

I'm also experimenting with fuzzy searching to make it easier to find things without needing to
type exact matches.

## Development set up

### Dependencies:
- Go v1.18+
- NodeJS v20+
- Yarn v1.x

### Installing `wails`

This application uses [wails](https://wails.io/) as a web platform based application container
similar but allot lighter than Electron.
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```
See [here](https://wails.io/docs/gettingstarted/installation/) for more detailed installation instructions. 

## Live Development

To run in live development mode, run `wails dev -tags webkit2_42`.

If you want to develop in a browser and have access to your Go methods, there is also a dev
server that runs on http://localhost:34115. Connect to this in your browser, and you can call
your Go code from devtools.

## Building

To build a redistributable, production mode package, run `wails build`.

## Building the `spellfix` sqlite extension

```shell
cd resources
curl -o sqlite-src https://sqlite.org/2023/sqlite-src-3430100.zip
cd resources/sqlite-src/ext/misc
gcc -I. -g -fPIC -shared spellfix.c -o spellfix.so
cp spellfix.so ../../..
```
