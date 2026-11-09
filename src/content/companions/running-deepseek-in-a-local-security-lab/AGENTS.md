# Build a local DeepSeek security lab

Reference date: 2026-11-04. This is the construction brief accompanying
[Running DeepSeek V4.1 in a local security lab](./).
It describes a working deployment and the checks needed to adapt it. It is not a one-command
installer or a complete copy of the private deployment automation.

Use this file as task context when the user asks for a similar lab. Do not treat its presence as
permission to scan targets or change existing infrastructure.

## Intended result

Run model inference on the user's GPU workstation. Keep prompts, responses and controller
transcripts on infrastructure the user operates. Execute model-requested commands in disposable
containers inside a separate VM. Route tool traffic through an independently administered gateway
that enforces scope and retains evidence.

Local inference removes the need to send model requests to a hosted inference provider. It still
trusts downloaded weights, runtime software and local machines. Tools can send data to allowed
destinations, so local inference alone does not make the entire agent workflow offline or private.

The public components do not supply this complete control plane. Implement the gateway grants, audit
health checks, Windows memory monitor and run cleanup for the user's environment. Commission those
integrations before claiming the same boundaries as the reference deployment.

## Inventory before provisioning

Record GPU model/VRAM, CPU features, RAM, free NVMe space, OS, driver and virtualization support. On
Windows/WSL, also record Windows committed memory, its limit and available physical memory. Linux
available memory alone does not describe host capacity.

The reference workstation has an RTX 5090 with 32 GB VRAM and approximately 64 GB physical RAM.
About 58 GiB was initially visible to WSL. These are observed capacities, not tested minimums. Two
Ubuntu 24.04 VMs run separately on Proxmox; their RAM does not augment inference RAM.

Required model data totals 248,834,183,872 bytes, about 249 decimal GB or 232 GiB. Allow additional
space for runtime files, pack metadata, logs and installation work. The reference uses a dedicated
320 GiB dynamic ext4 VHD for model storage. A dynamic VHD can grow and still requires real free
space on its Windows volume. Do not resize disks, delete existing copies or stop a user's WSL
sessions implicitly.

## Public sources and software pins

| Component           | Reference                                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Edited model        | [AtomicChat model card](https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF), revision `4f1d2f730cff977961db81789e81bfc0d3e6dd2e`                                 |
| Engram              | [ISTA-DASLab files](https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF/tree/cb02422c900df489cea5833e8a92171224059b3c), revision `cb02422c900df489cea5833e8a92171224059b3c` |
| Pack metadata input | [Unsloth files](https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF/tree/8a6ec9cf118e785a362ea94ee123c61c70553be6), revision `8a6ec9cf118e785a362ea94ee123c61c70553be6`                 |
| Strata              | [Source](https://github.com/Niko1221/Strata/tree/ffa80d73133ea5c548aefe57889a16e8085a938f), application 0.2.10, source commit `ffa80d73133ea5c548aefe57889a16e8085a938f`                         |
| Native engine       | `strata-dsv41` 0.1.56, build `06698c674673+dsv41+cuda13.0`                                                                                                                                       |
| Controller          | `inspect-ai==0.3.287`, with `openai==3.42.1` for its OpenAI-compatible provider                                                                                                                  |
| Tools               | [Rootless Docker](https://docs.docker.com/engine/security/rootless/) with stock `runc` inside a dedicated VM                                                                                     |

Read the pinned
[Strata DeepSeek guide](https://github.com/Niko1221/Strata/blob/ffa80d73133ea5c548aefe57889a16e8085a938f/docs/DEEPSEEK41.md)
and
[packer source](https://github.com/Niko1221/Strata/blob/ffa80d73133ea5c548aefe57889a16e8085a938f/tools/dsv41/pack_gguf.py).
Use this model-specific recipe rather than a hosting site's generic library snippets. The default
upstream setup selects the official weights and may download a drafter; that is different from this
edited AtomicChat profile with drafting disabled.

The reference signed engine archive is `strata-dsv41-0.1.56-linux-x86_64-cuda-cuda13.tar.gz`,
445,183,066 bytes, SHA-256 `72c11c7883f0d1af56cab3f338968e98c829270d0658e42476280c469106ee91`.
Verify its signed feed and component manifest using the pinned publisher key. If that release is
unavailable, record the replacement and repeat acceptance checks. Do not label an untested version
equivalent to the reference.

The release feed is published at
`https://github.com/Niko1221/Strata/releases/latest/download/strata-feed.json`, with its `.sig`
sibling. Resolve the required package through the verified feed; `latest` can change. The pinned
[update keys](https://github.com/Niko1221/Strata/blob/ffa80d73133ea5c548aefe57889a16e8085a938f/strata_control/update_keys.json)
identify the feed/component Ed25519 key as `5d1bc23abbeffd0d`, public bytes in base64
`KjnXZB0T1r3dmBNot8h+c4rTicRtllg1LH9fUlTw4ZY=`. Follow the pinned
[signature format and verification procedure](https://github.com/Niko1221/Strata/blob/ffa80d73133ea5c548aefe57889a16e8085a938f/packaging/UPDATES.md).
A matching signature establishes publisher-key provenance, not binary safety.

## Download and verify the model

Use the Hugging Face CLI in a preparation environment with network access. The following commands
download weights only; they do not install or start inference.

```sh
hf download AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF \
  --revision 4f1d2f730cff977961db81789e81bfc0d3e6dd2e \
  --include '*IQ2_XXS*' --local-dir ./models/deepseek-iq2-xxs

hf download ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF \
  --revision cb02422c900df489cea5833e8a92171224059b3c \
  --include DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf \
  --local-dir ./models/deepseek-iq2-xxs

hf download unsloth/DeepSeek-V4.1-Flash-1017-GGUF \
  --revision 8a6ec9cf118e785a362ea94ee123c61c70553be6 \
  --include 'UD-Q8_K_XL/DeepSeek-V4.1-Flash-1017-UD-Q8_K_XL-00001-of-00009.gguf' \
  --local-dir ./models/metadata
```

All four backbone names begin `DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ2_XXS-`. Check every file against
this manifest before packing:

| File suffix or complete name               |        Bytes | SHA-256                                                            |
| ------------------------------------------ | -----------: | ------------------------------------------------------------------ |
| `00001-of-00004.gguf`                      |  39075714624 | `d46efb67ccffd8fb5d7f18b423896381b9e06d8491e161c370ddf3b05b07e050` |
| `00002-of-00004.gguf`                      |  39388449504 | `cec1b2c3da429dc768b8bb9bc4dc4403d81f74d34db660a6a34ee3e555bf2c70` |
| `00003-of-00004.gguf`                      |  39246891616 | `9d9c2140fcb134a0b9a74dedd0e5167e68077af6d08ce7f856bce112f0a35dd3` |
| `00004-of-00004.gguf`                      |  20527837312 | `92e1b7aac2c27451977f093b89207a877221bba909424309450420f66fa42bf9` |
| `DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf`   | 110595290816 | `eb19f30d368d393784e1fc54fdfaffc427ebb2110bf3762fdf5a8fbb9a2d740a` |
| Metadata shard named in the third download |      5780589 | `cc15d470afcb030558bbc4d8e2ccd840182e2e95de1a95198138efe63a5fd99f` |

Pack in a CPU-only constrained environment with read-only inputs and a fresh output directory. Use
the pinned packer's explicit shard, Engram and metadata inputs. Include the shipped
`data/dsv41/profile-2.00.bin` expert profile as documented upstream. The pack references the
original weight files. Keep those files at their final paths. Do not copy another full set into a
download cache or assume the small metadata pack is standalone. Do not use `--skip-tensors` or
`--dense-override` to bypass packing work.

## Inference configuration

These values describe the accepted reference, not universal performance optima:

| Setting                             | Reference value                    |
| ----------------------------------- | ---------------------------------- |
| Engine context                      | 32,768 tokens                      |
| Concurrent requests                 | One                                |
| Experts per token                   | Six                                |
| Expert RAM store                    | 34 GB                              |
| CPU workers / quota                 | Eight / eight cores                |
| Drafting                            | `--dspark none`                    |
| Engine synchronization              | `DS4_SYNC=1`                       |
| Variables explicitly absent         | `CUDA_LAUNCH_BLOCKING`, `DS4_PROF` |
| Vision and inference-side MCP       | Disabled                           |
| Maximum output per model completion | 2,048 tokens                       |

Map these settings through the pinned server's configuration schema and native engine help. Check
the effective arguments in startup logs; do not invent flag names from this table. The server entry
point is `serve/server.py` with the `strata` engine and offline mode. Use a private authenticated
API reachable only by the trusted controller. The controller's HTTP client must disable redirects
and environment proxy inheritance. Do not expose the inference API as the reader-facing LAN preview
of a website.

Use a dedicated service identity, restricted filesystem and separate network namespace. Expose only
read-only model/runtime/configuration paths and private writable state. Keep personal homes, Windows
user directories and Docker sockets out of inference. Expose only the required GPU device; allow no
general tool execution from the inference server. Require the model filesystem mount before service
startup. Coordinate exclusive GPU ownership with any existing model service.

The reference service uses `MemoryHigh=48G`, `MemoryMax=52G`, `MemorySwapMax=0` and `CPUQuota=800%`.
Also monitor Windows memory during loading and generation. Its profiler stops inference after two
samples below 8 GiB of Windows commit headroom, or on loss of that telemetry. These limits require
adaptation to the user's host.

The Windows monitor is custom integration work. Collect committed/limit/available memory on the host
and deliver timestamped samples to a trusted supervisor that can stop inference. Record the sampling
interval and test stale/missing telemetry. For native Linux, implement and test the corresponding
host-memory checks rather than assuming the Windows thresholds apply.

## Tool execution and gateway

Use [Inspect's agent](https://inspect.aisi.org.uk/agents.html) and
[Docker sandbox](https://inspect.aisi.org.uk/sandboxing.html) on the trusted controller. Its
[shell and editor tools](https://inspect.aisi.org.uk/tools-standard.html) dispatch work to a remote
rootless Docker daemon over pinned SSH. Keep the SSH credential and Docker principal outside the
model's container.

Provision a tools VM with one private NIC and a separate gateway VM with private and LAN interfaces.
The private bridge has no physical ports or host IP. The tools VM has no alternate default route.
Apply network policy on the gateway, outside the tools VM. Protect hypervisor, gateway management,
inference and controller endpoints explicitly.

Build and pin a CPU-only tools image. Start with curl, Python and the tools required by the task.
The reference also includes Nmap and several application-protocol clients. Configure non-root UID
10001, a read-only root, no Linux capabilities and no new privileges. Set four CPUs, 8 GiB RAM and
128 processes as reference container ceilings. Provide bounded writable temporary/work directories
without personal or credential mounts. Rootless `runc` shares the tools VM's kernel; the VM supplies
the primary kernel boundary. Rootless gVisor failed commissioning here and is not part of the
accepted reference.

Enforce approved protocol/IP/port tuples at the gateway. Handle DNS explicitly and block bypasses,
metadata routes, management destinations and IPv6 unless an equivalent IPv6 policy is implemented.
Human-approved public grants expire and must revoke existing flows as well as new ones. An IP/port
grant allows application data on that connection; it does not restrict URL paths or protocol
commands.

Capture packets on the gateway and forward authenticated exec/file audit events there from the tools
VM. Stop forwarding on unhealthy capture, audit loss, stale audit heartbeat or insufficient capture
disk space. Keep packet captures, firewall decisions and Inspect transcripts under the same run
identifier. Bound retention and preserve evidence outside the disposable container. Do not audit
every socket syscall: that stream overflowed under a full-port scan in this deployment. Packet
captures cannot reveal encrypted TLS/SSH payloads.

Use guest-kernel audit records for process execution and the configured container file watches,
including changes made by shell commands. Correlate container labels, process identity and
timestamps with the controller's run ID. Keep audit and heartbeat credentials outside the
unprivileged container. Check kernel loss counters, forwarding health and heartbeat age. Define file
watches explicitly; do not claim that every possible file operation is captured. Guest kernel/root
and gateway remain trusted boundaries; a guest-root compromise drill was not run.

Start with human-approved destinations. The reference also has an optional monitored mode whose
gateway permission belongs to a live controller SSH session. Session loss closes egress. It can
enforce a tool-call cap and exact tuples before execution. A prompt describing a scope or call count
does not implement either control.

In human-approval mode, individual grants expire and normal teardown revokes them. The reference
arms a root-owned container-expiry timer before container creation. Do not promise instant grant
revocation on controller loss without a separate gateway lease or supervisor that enforces it.

## Commission in stages

1. Check hashes, runtime signature, available storage and the effective configuration.
2. With tools disconnected, check that inference cannot read a synthetic personal secret or reach
   public services.
3. Load the model and generate a short answer. API model/context metadata alone does not prove
   generation works.
4. Run a CPU-only mock-model task through Inspect and the actual remote sandbox.
5. Run a real-model task that executes a fixed harmless command and returns a fresh random value.
6. Check that its Inspect transcript, container execution and externally retained event agree.
7. On a controlled target, check denial, approval, expiry and revocation of an established
   connection.
8. Stop capture and audit health separately. Check that each closes tool egress and retains failure
   evidence.
9. In monitored mode, disconnect or kill the controller and check that its gateway lease closes
   egress. In human-approval mode, check grant expiry and the independent container-expiry timer.
10. Run a longer input and multi-tool task before describing a larger context window as validated.

Before every run, record authorized targets and operations, budgets and expected completion
evidence. After every run, remove its labelled containers, stop isolated inference and pause the
gateway. Record cleanup errors as requiring recovery. Do not silently restore another model service.
For a human-facing control UI, return a verified LAN link rather than a loopback URL.

Document emergency gateway pause, grant removal, run-labelled container cleanup and residual
inference-process checks. On restart, bring up gateway policy and healthy evidence collection before
permitting tools to run. Test reboot recovery before relying on unattended operation.

## Results to preserve when adapting

- A 12,180-token input completed ten shell/editor operations and recalled five random strings at a
  configured 32K context.
- Native 64K and Windows/Proxmox reboot recovery remain untested.
- Fully asynchronous CUDA generation failed. `DS4_SYNC=1` passed; the original cause remains
  unresolved.
- The ext4 move improved preload without improving matched warmed decoding.
- A larger expert cache crossed the Windows memory guard; 34 GB passed the realistic prompt on this
  host.
- Forced drafting and sixteen CPU workers did not materially improve the fixed comparison task.
- A narrow task contacted the wrong mail host and listed shares beyond the requested protocol check.
  Later exact-destination enforcement passed a live control-plane test without the model. Operation
  restrictions inside an allowed service remain a separate problem.
- No confirmed vulnerability or general model-security conclusion resulted from these experiments.

Deliver an inventory, adapted configuration, artifact hashes, acceptance results and recovery
procedure. Separate measured behavior from upstream claims and untested assumptions.
