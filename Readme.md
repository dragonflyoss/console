# Dragonfly Console

<!-- markdownlint-disable -->
<div align="center">
  <img src="public/images/dragonfly-vertical.png"  title="dragonfly-logo">
</div>
<!-- markdownlint-restore -->

[![GitHub release](https://img.shields.io/github/release/dragonflyoss/Dragonfly.svg)](https://github.com/dragonflyoss/console/releases)
[![LICENSE](https://img.shields.io/github/license/dragonflyoss/Dragonfly.svg?style=flat-square)](https://github.com/dragonflyoss/console/blob/main/LICENSE)
[![Coverage](https://codecov.io/gh/dragonflyoss/Dragonfly/branch/main/graph/badge.svg)](https://codecov.io/gh/dragonflyoss/Dragonfly)

## Introduction

**Dragonfly Console** is the front-end console of Dragonfly, through which you can easily configure clusters and view your cluster information intuitively,set security rules.

## Functionality Overview

- **Scheduler Cluster:** Intuitively display the cluster's Name Description IDC Load Limit and the Scheduler's Hostname IP Port and other information, which is more simple and clear for you to operate the cluster.

- **Security:** You can create security groups and security rules here, associate the specified security rules, edit or delete them.

- **Permissions:** List the objects and actions of all Permissions and Roles.

- **Task:** List all tasks and allow you to create tasks here, including adding URLs and ranges for task types.

- **User**: List the user name status and other information. You can change the user role here.

## Documentation

You can find the complete **Dragonfly** documentation on the [d7y.io][d7y.io].

## Getting Started

Install dependencies

1. Install Toolset: [NodeJS](https://nodejs.org/en/download/) and [Yarn](https://yarnpkg.com).
1. Install Dependencies: From your command line, navigate to the console directory and run `yarn install` to install dependencies.
1. Run: `yarn dev` - starts dev server.

## Code of Conduct

Please refer to our [Code of Conduct][codeconduct].

[logo-linear]: public/images/dragonfly-vertical.png
[d7y.io]: https://d7y.io/
[codeconduct]: CODE_OF_CONDUCT.md
