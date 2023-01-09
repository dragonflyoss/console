# Dragonfly Console

[![GitHub release](https://img.shields.io/github/release/dragonflyoss/Dragonfly.svg)](https://github.com/dragonflyoss/console/releases)
[![LICENSE](https://img.shields.io/github/license/dragonflyoss/Dragonfly.svg?style=flat-square)](https://github.com/dragonflyoss/console/blob/main/LICENSE)
[![CI](https://img.shields.io/badge/CI-unknown-orange.svg?logo=github)](https://github.com/dragonflyoss/console/tree/v1)
[![Coverage](https://codecov.io/gh/dragonflyoss/Dragonfly/branch/main/graph/badge.svg)](https://codecov.io/gh/dragonflyoss/Dragonfly)

## Introduction

Dragonfly Console is the front-end console of dragonfly, through which you can easily configure clusters and view cluster information.

## Functionality Overview

- **Scheduler Cluster:** Visually display the cluster name, description, IDC, load limit and the host name, IP, port and other information of the scheduler, and you will operate the cluster more simply and clearly.

- **Security:** You can create security groups and security rules here, and you can also specify associated security rules, edit or delete them.

- **Permissions:** List the objects and actions of all permissions and roles.

- **Task:** List all tasks and allows you to create tasks here, including adding URLs, task types, and scopes.

- **User**: List the user name status and other information, you can change the user role here.

## Documentation

You can find the full documentation on the [d7y.io][d7y.io].

## Getting Started

**Quick start**

1. Navigate to the console directory from the command line.
1. Install [NodeJS](https://nodejs.org/en/download/) and ensure that it is above 18.x edition.
1. Install dependencies by running [Yarn](https://yarnpkg.com).
1. Run `yarn dev` starts dev server.

## Code of Conduct

Please refer to our [Code of Conduct][codeconduct].

[logo-linear]: public/images/dragonfly-vertical.png
[d7y.io]: https://d7y.io/
[codeconduct]: CODE_OF_CONDUCT.md
[Manage Console]:https://d7y.io/docs/reference/manage-console/