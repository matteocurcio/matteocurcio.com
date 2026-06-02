---
title: "Building a Dedicated Observability Kiosk for My Proxmox Homelab"
date: "2026-06-02"
excerpt: "A practical architecture note on turning a Proxmox homelab into a visible, rack-mounted observability system using Grafana, Prometheus, Loki, PULSE, and a Raspberry Pi kiosk."
description: "A practical architecture note on turning a Proxmox homelab into a visible, rack-mounted observability system using Grafana, Prometheus, Loki, PULSE, and a Raspberry Pi kiosk."
cover: "/images/blog/proxmox-observability-kiosk/proxmox-lab-observability-architecture.jpg"
coverAlt: "High-level architecture of a Proxmox MiniPC lab observability platform running on a Minisforum MS-01"
ogImage: "/images/blog/proxmox-observability-kiosk/proxmox-lab-observability-architecture.jpg"
ogImageAlt: "High-level architecture of a Proxmox MiniPC lab observability platform running on a Minisforum MS-01"
tags:
  - "Homelab"
  - "Proxmox"
  - "Observability"
  - "Grafana"
  - "Prometheus"
  - "Loki"
  - "Raspberry Pi"
draft: false
writingKind: "technical"
---

## Introduction

Every homelab eventually develops the same problem.

Not a hardware problem.

Not a networking problem.

A visibility problem.

As infrastructure grows, understanding the state of the environment becomes increasingly difficult. What begins as a single server evolves into a collection of virtual machines, firewalls, switches, VLANs, backup systems, monitoring platforms, logging systems, VPN gateways, and security tooling.

At some point the challenge stops being building infrastructure and becomes understanding infrastructure.

My homelab reached that point during the transition from a simple Proxmox server to a multi-service environment built around a Minisforum MS-01 running Proxmox VE, OPNsense, Grafana, Loki, Prometheus, UniFi, Proxmox Backup Server, and a growing collection of Linux virtual machines.

I found myself repeatedly opening browser tabs to answer simple questions:

- Is the hypervisor healthy?
- Are backups succeeding?
- Is the internet connection stable?
- Did a VM stop unexpectedly?
- Why is CPU utilisation suddenly high?
- What firewall events occurred overnight?

The information existed, but it was fragmented across multiple interfaces.

The solution was not another dashboard.

The solution was a dedicated observability appliance.

Today a rack-mounted touchscreen continuously displays the operational state of the environment using Grafana dashboards backed by Prometheus and Loki. The kiosk functions as a miniature Network Operations Centre, providing visibility into infrastructure, networking, security, logging, and backup health from a single physical interface.

This article documents the hardware, software, architecture, and dashboard design behind that system.

## The Infrastructure Being Monitored

The observability platform monitors a virtualised infrastructure running on a Minisforum MS-01.

The MS-01 acts as the primary Proxmox hypervisor and hosts the core services of the lab.

These include:

- OPNsense firewall
- GRAFANA virtual machine
- PULSE virtual machine
- UniFi Controller
- PBS (Proxmox Backup Server)
- Linux infrastructure servers
- Security tooling
- Test and training environments

The environment is segmented using multiple VLANs and routed through OPNsense.

The kiosk therefore does not monitor a single server.

It monitors an entire infrastructure stack.

![High-level architecture of the observability platform running on a Minisforum MS-01 with Proxmox VE, showing the physical, hypervisor, VM, observability and presentation layers.](/images/blog/proxmox-observability-kiosk/proxmox-lab-observability-architecture.jpg)

*Figure 1: The full picture: the Minisforum MS-01 bare-metal host, the Proxmox VE hypervisor, the VM layer (OPNsense, UniFi, PBS, Tailscale, GRAFANA, PULSE), the dedicated NVMe observability storage, and the Raspberry Pi kiosk presentation layer.*

## Design Philosophy

The project was built around several guiding principles.

### Visibility Without Interaction

The most useful monitoring systems are the ones you do not need to open.

Operational information should be immediately visible.

Walking past the rack should provide enough information to determine whether the environment is healthy.

### Separation of Concerns

Each component should perform one role.

The display system displays.

The collection platform collects.

The visualisation platform visualises.

The storage layer stores.

This simplifies troubleshooting and improves reliability.

### Disposable Clients

The display client should contain no critical state.

If the display hardware fails, monitoring should continue uninterrupted.

The kiosk is therefore treated as a replaceable endpoint rather than part of the monitoring platform itself.

## Hardware

### Raspberry Pi Display Client

The display client is a Raspberry Pi 5 with 8GB of RAM and an official Raspberry Pi Active Cooler.

The Raspberry Pi boots from a microSD card and runs Raspberry Pi OS.

Unlike many Raspberry Pi projects, no SSD is used.

The reason is simple.

The Raspberry Pi performs no data collection, no database operations, and no storage-intensive workloads.

Its only responsibilities are:

- Running Chromium
- Running Python automation scripts
- Displaying dashboards

The workload is extremely light and does not justify the complexity of SSD storage.

| Component | Specification |
| --- | --- |
| Platform | Raspberry Pi 5 |
| Memory | 8GB LPDDR4X |
| Cooling | Raspberry Pi Active Cooler |
| Storage | microSD Card |
| Operating System | Raspberry Pi OS |
| Browser | Chromium |
| Purpose | Dashboard Display Client |

![Architecture of the Raspberry Pi 5 kiosk client: a Python controller handling configuration, rotation, input, browser control and health monitoring, driving Chromium in kiosk mode over HDMI to a rack display, with a 7-key USB keypad for navigation.](/images/blog/proxmox-observability-kiosk/kiosk-client-architecture.jpg)

*Figure 2: The kiosk client internals. A Python controller manages dashboard navigation, rotation and session recovery; Chromium runs full-screen in kiosk mode; the Pi has no network path to the monitored systems and only outputs video.*

### Rack-Mounted Touchscreen

The display itself is a GeekPi 9-inch rack-mounted touchscreen.

The screen occupies 3U of rack space and is mounted directly into the infrastructure rack.

Specifications:

| Component | Specification |
| --- | --- |
| Manufacturer | GeekPi |
| Display Size | 9-inch |
| Resolution | 1280 x 720 |
| Touch Technology | Capacitive Touch |
| Rack Height | 3U |
| Interface | HDMI + USB Touch |

Unlike a desk monitor, the rack-mounted display becomes part of the infrastructure itself.

The state of the environment is visible every time the rack is approached.

### Dashboard Control Keypad

Mounted beneath the screen is a programmable seven-key mechanical USB keypad.

Each key corresponds to a specific dashboard.

This allows immediate navigation without requiring a mouse, keyboard, or touchscreen interaction.

The result feels less like a computer and more like a dedicated operational appliance.

## Architecture

The observability platform consists of three independent layers.

![Observability data flow: every system ships metrics to Prometheus and logs to Loki on the PULSE VM, which writes to dedicated NVMe storage; GRAFANA reads from PULSE for visualisation, and the Raspberry Pi kiosk only displays dashboards.](/images/blog/proxmox-observability-kiosk/observability-data-flow.jpg)

*Figure 3: How data moves. All metrics are scraped by Prometheus and all logs are shipped to Loki, both running on the PULSE VM and stored on dedicated NVMe. GRAFANA queries PULSE; the kiosk simply renders the result.*

### Presentation Layer

Hardware:

- Raspberry Pi 5
- Chromium
- Python control software

Responsibilities:

- Display dashboards
- Dashboard switching
- Automatic dashboard rotation

The Raspberry Pi stores no metrics and no logs.

It is effectively a dedicated browser appliance.

### Visualisation Layer

Hosted on:

GRAFANA VM

Responsibilities:

- Dashboard rendering
- Historical visualisation
- Alert presentation
- User access management

Grafana is responsible for displaying information.

Grafana is not responsible for collecting information.

This distinction is fundamental to the architecture.

### Collection Layer

Hosted on:

PULSE VM

Responsibilities:

- Metrics collection
- Log collection
- Time-series storage
- Telemetry processing

PULSE acts as the observability backend.

Every monitored device ultimately reports telemetry to PULSE.

If GRAFANA is the face of the platform, PULSE is the engine room.

### Where the Virtual Machines Run

Both GRAFANA and PULSE run as dedicated virtual machines on the Minisforum MS-01 Proxmox host.

This architecture provides several advantages:

- VM snapshots
- Backup integration
- Resource isolation
- Simplified migration
- Operational separation

The hierarchy looks like this:

```text
MS-01 Physical Host
├── OPNsense VM
├── UniFi VM
├── PBS VM (Proxmox Backup Server)
├── Tailscale VM
├── GRAFANA VM
├── PULSE VM
├── Linux Infrastructure VMs
└── Security/Test VMs
```

The Raspberry Pi sits completely outside this hierarchy.

If the Raspberry Pi fails, monitoring continues.

If Grafana fails, collection continues.

If the collection platform fails, the display continues operating but loses access to fresh data.

Each layer can fail independently.

## Dedicated NVMe Storage

One of the most important design decisions was separating observability data from operating system storage.

Prometheus and Loki generate continuous write activity.

Every minute:

- Metrics are recorded
- Logs are written
- Databases are updated
- Historical telemetry grows

Over time, observability becomes one of the busiest storage workloads in the environment.

For this reason, all telemetry is written to a dedicated NVMe volume.

This includes:

- Prometheus databases
- Loki storage
- Historical metrics
- Historical logs

Separating telemetry storage provides:

**Better Performance**

Metrics and logs do not compete with operating system activity.

**Simpler Backups**

Telemetry can be backed up independently.

**Easier Migration**

Observability data can be moved separately from the virtual machines themselves.

**Better Scalability**

Retention periods can increase without redesigning storage.

## Understanding the Data Sources

The kiosk relies on two primary observability technologies.

### Prometheus

Prometheus stores numerical time-series metrics.

Examples:

- CPU utilisation
- Memory usage
- Storage consumption
- Network throughput
- Uptime
- Temperatures
- Backup durations

Prometheus answers:

*What is happening?*

### Loki

Loki stores logs.

Examples:

- Firewall events
- Authentication failures
- Service crashes
- VPN activity
- Application errors
- System events

Loki answers:

*Why did it happen?*

Together they provide both state and context.

## The Dashboards

Grafana dashboards are organised by function. Each dashboard answers a specific question and is powered by the right combination of metrics (Prometheus) and logs (Loki).

![Dashboard hierarchy and data sources: from the kiosk client, an Executive Overview branches into Infrastructure, Network Operations, Security Operations, Centralised Logging and Backup Operations, each labelled with its question and whether it draws on Prometheus, Loki or both.](/images/blog/proxmox-observability-kiosk/dashboard-hierarchy-data-sources.jpg)

*Figure 4: The six dashboards at a glance. Each answers one operational question and is powered by the appropriate mix of Prometheus metrics and Loki logs.*

### Dashboard 1: Executive Overview

Question:

*Is the environment healthy?*

This dashboard is designed to be understood in under five seconds.

**Hypervisor Health**: Source: Prometheus. Origin: Proxmox exporter. Displays CPU %, RAM %, Storage %, and Uptime. Provides immediate visibility into host health.

**Running Virtual Machines**: Source: Prometheus. Origin: Proxmox API. Displays total VMs, running VMs, and stopped VMs. Used to detect unexpected outages.

**WAN Status**: Source: Prometheus. Origin: OPNsense. Displays latency, packet loss, and gateway status. Often the fastest indicator of external connectivity issues.

**Backup Status**: Source: Prometheus. Origin: PBS (Proxmox Backup Server) metrics. Displays the last successful backup, backup age, and success state. Arguably the most important panel in the entire system.

**Active Alerts**: Source: Prometheus. Origin: alerting rules. Displays infrastructure, availability, and storage alerts. Provides immediate visibility into abnormal conditions.

### Dashboard 2: Infrastructure

Question:

*How is the platform performing?*

Almost every panel on this dashboard uses Prometheus.

**Hypervisor CPU**: Source: Prometheus. Origin: Proxmox exporter. Displays CPU utilisation over time. Used to identify resource contention.

**Hypervisor Memory**: Source: Prometheus. Origin: Proxmox exporter. Displays memory utilisation trends. Useful for identifying memory pressure before performance degradation occurs.

**Storage Consumption**: Source: Prometheus. Origin: Proxmox exporter. Displays datastore utilisation and growth trends. Supports capacity planning.

**VM Resource Utilisation**: Source: Prometheus. Origin: Node Exporters. Displays CPU, RAM, and Disk. Provides visibility into guest workloads.

**VM Availability**: Source: Prometheus. Origin: Proxmox. Displays VM state and VM uptime. Allows rapid identification of failed guests.

### Dashboard 3: Network Operations

Question:

*What is happening on the network?*

This dashboard combines Prometheus metrics with Loki event data.

**WAN Throughput**: Source: Prometheus. Origin: OPNsense. Displays upload traffic, download traffic, and historical utilisation.

**Gateway Latency**: Source: Prometheus. Origin: OPNsense. Displays RTT, packet loss, and gateway state. Often the first indicator of ISP problems.

**DNS Activity**: Source: Prometheus. Origin: Unbound DNS. Displays query volume, cache efficiency, and resolver activity. Useful for identifying unusual behaviour.

**VPN Status**: Source: Prometheus. Origin: WireGuard / OPNsense. Displays tunnel status, handshake age, and transfer volume. Critical for remote administration.

**Firewall Events**: Source: Loki. Origin: OPNsense syslog. Displays denied connections, rule hits, and top blocked destinations. Unlike throughput graphs, these panels are log-driven.

### Dashboard 4: Security Operations

Question:

*Is anything behaving unexpectedly?*

Most panels on this dashboard use Loki. Security monitoring is fundamentally event-based.

**Authentication Failures**: Source: Loki. Origin: Linux auth logs, SSH logs, OPNsense logs. Displays failed login activity.

**Firewall Denies**: Source: Loki. Origin: OPNsense. Displays blocked traffic and policy violations.

**VPN Events**: Source: Loki. Origin: WireGuard / OPNsense. Displays connection events and errors.

**IDS / IPS Events**: Source: Loki. Origin: security tooling (Suricata). Displays triggered signatures and severity levels.

**Security Timeline**: Source: Loki. Origin: multiple sources. Provides a chronological event stream.

### Dashboard 5: Centralised Logging

Question:

*What actually happened?*

Every panel on this dashboard uses Loki. This dashboard exists for investigation rather than monitoring.

**OPNsense Logs**: Source: Loki. Origin: OPNsense syslog. Used for routing, firewall, and DNS troubleshooting.

**Proxmox Logs**: Source: Loki. Origin: Proxmox. Used for VM lifecycle and infrastructure analysis.

**Linux Logs**: Source: Loki. Origin: Linux virtual machines. Used for service troubleshooting and authentication analysis.

**Application Logs**: Source: Loki. Origin: hosted services. Used for debugging application behaviour.

### Dashboard 6: Backup Operations

Question:

*Can I recover if something fails?*

This dashboard combines Prometheus metrics with Loki investigation panels.

**Backup Success Rate**: Source: Prometheus. Displays historical backup success rates.

**Backup Duration**: Source: Prometheus. Displays runtime trends.

**Repository Utilisation**: Source: Prometheus. Displays storage consumption and growth.

**Failed Backup Events**: Source: Loki. Origin: PBS logs. Displays detailed failure reasons.

**Recovery Readiness**: Source: combined (Prometheus metrics + Loki validation events). Answers a single question: if the hypervisor died right now, could the environment be recovered?

## Conclusion

The most valuable outcome of this project was not the dashboards.

It was the shift from reactive administration to continuous awareness.

The infrastructure no longer needs to be checked.

It continuously reports its own condition.

Prometheus provides state.

Loki provides context.

Grafana turns both into information.

PULSE collects and stores telemetry.

GRAFANA visualises it.

The Raspberry Pi presents it.

Together they form a dedicated observability platform that transforms a collection of servers, virtual machines, and services into something that can be understood at a glance.
