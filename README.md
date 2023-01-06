# Dragonfly Console

![alt][logo-linear]

[![GitHub release](https://img.shields.io/github/release/dragonflyoss/Dragonfly2.svg)](https://github.com/dragonflyoss/Dragonfly2/releases)
[![LICENSE](https://img.shields.io/github/license/dragonflyoss/Dragonfly2.svg?style=flat-square)](https://github.com/dragonflyoss/console/blob/main/LICENSE)
[![LICENSE](https://img.shields.io/github/license/dragonflyoss/Dragonfly2.svg?style=flat-square)](https://github.com/dragonflyoss/Dragonfly2/blob/main/LICENSE)

## Introduction

- Dragonfly is an open-source p2p-based image and file Distribution System.
It is designed to improve the efficiency and speed of large-scale file distribution.

- Provideefficient, stable, secure, low-costfile and image
distribution services to be the best practice and standard solution
in cloud native architectures. It is hosted by the Cloud Native
Computing Foundation ([CNCF](https://cncf.io/)) as an Incubating Level Project.

- Dragonfly-console is a front console,which is convenient for users to visually operate the cluster.

## Functionality Overview

**P2P File Distribution:** Use P2P technology for file transfer, improve download efficiency,
and save bandwidth across IDC.

**Noninvasive:** Supports multiple containers for distributing images.

**Host-level speed limit**: Support for host-level limits speed.

**Consistency**: Make sure all downloaded files are consistent.

**Isolate abnormal peers**: Automatically isolate abnormal peers to improve download stability.

**Ecosystem**: Harbor can distribute and preheat images based on the Dragonfly.
Image acceleration based on Nydus container runtime can use Dragonfly for data distribution.

**You can find the full documentation on the [d7y.io][d7y.io].**


## Getting Started

Install dependencies,

```bash
 yarn
```

Start the dev server,

```bash
 yarn dev
```

Build

```bash
 yarn build
```

## Code of Conduct

Please refer to our [Code of Conduct][codeconduct].

[logo-linear]: public/images/dragonfly-vertical.svg
[d7y.io]: https://d7y.io/
[codeconduct]: CODE_OF_CONDUCT.md
