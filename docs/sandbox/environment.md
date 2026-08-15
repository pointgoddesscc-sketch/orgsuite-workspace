# Sandbox Environment

Technical reference for the remote Grok sandbox used in OrgSuite work.

## Typical Characteristics

| Item              | Typical Value                          |
|-------------------|----------------------------------------|
| OS                | Ubuntu 24.04 LTS (Noble Numbat)        |
| Kernel            | Recent mainline (e.g. 6.12.x)          |
| Architecture      | x86_64                                 |
| Virtualization    | KVM                                    |
| CPU               | 2 vCPU (Intel Xeon class)              |
| Memory            | ≈ 2 GiB                                |
| Root filesystem   | Overlay (≈ 20 GB)                      |
| Working directory | `/home/workdir/artifacts`              |
| User              | `root` (inside the isolated container) |

## Filesystem Notes

- `/home/workdir/artifacts` is the primary working directory and is backed by a high-capacity FUSE mount (`grok-files`).
- Custom skills live under `/home/workdir/.grok/skills/`.
- The environment is designed to be lightweight and disposable.

## Network

- Outbound internet is enabled.
- No inbound services are exposed by default.
- No Bluetooth or local network discovery is available.

## Operational Notes

- Each conversation typically starts with a fresh or near-fresh instance.
- Files created under `/home/workdir/artifacts` can be shared with the user and later promoted to permanent storage.
- The sandbox has no persistent identity or long-term state across completely separate sessions unless content is deliberately preserved elsewhere.

This document describes the expected environment. Exact values (hostname, public IP, exact memory usage) change per instance and should be treated as ephemeral.
