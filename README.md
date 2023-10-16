# REFI

`Refi` is an open source API Documentation Browser for `Linux`, which makes use of [DocSets](https://kapeli.com/docsets)
(with permission) originally used in the [Dash](https://kapeli.com/dash) application for OSX.

[refi-demo.webm](https://github.com/christian-schulze/refi/assets/239226/fd230e2e-f884-41eb-a410-8051e04956da)

## Status

This project is still very much a WIP, however you can install DocSets, search for and view results.

### Missing features:
- auto update docsets at startup
- auto update docsets on a schedule
- global hotkey activation
- per docset favorites
- flesh out settings page
- others?

## Development

### Dependencies:
- Go v1.18+
- NodeJS v20+
- Yarn v1.x

### Installing `wails`

This application uses [wails](https://wails.io/), which is a Go based web application container
similar but allot lighter than Electron.
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```
See [here](https://wails.io/docs/gettingstarted/installation/) for more detailed installation instructions. 

### Live Development

To run in live development mode, run `wails dev -tags webkit2_42`.

If you want to develop in a browser and have access to your Go methods, there is also a dev
server that runs on http://localhost:34115. Connect to this in your browser, and you can call
your Go code from devtools.

### Building

To build a redistributable, production mode package, run `wails build`.

## Contributing

If you find a bug please log an issue, decribing in as much detail as possible including your OS.

To avoid your hard work not being merged, please discuss any changes or fixes with me first. Once we
agree on a solution, fork the repo and create a pull request, making sure to link any related issue.

## License

Distributed under the `GPL-3.0` License. See [LICENSE](LICENSE) for more information.

## Acknowledgments

- Thank you `Bogdan` for creating [Dash](https://kapeli.com/dash) for OSX, and allowing me to use DocSets in this project.
- [wails](https://wails.io/) - Go based web application container (similar but lighter than Electron).
