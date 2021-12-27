import psutil

from .. import rest

from flask import Blueprint
from flask_login import login_required

system = Blueprint("system", __name__, url_prefix="/api/system")


@system.route("/", methods=["GET", "POST"])
@login_required
def system_info():
    """
    Endpoint to return system information
    """
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    cpu_freq = psutil.cpu_freq()

    # Get disk info for each disk
    partitions = psutil.disk_partitions()
    disk_info = dict()
    for partition in partitions:
        try:
            short_name = partition.device.split("/")[2]
            usage = psutil.disk_usage(partition.mountpoint)
            disk_info[short_name] = {
                "mountPoint": partition.mountpoint,
                "fileSystem": partition.fstype,
                "size": {
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "percent": usage.percent
                }
            }
        except PermissionError:
            # Prevent permission denied on drives from breaking this endpoint
            pass

    # Get network stats for each nic
    net_io_counters = psutil.net_io_counters()
    net_if_addrs = psutil.net_if_addrs()
    net_if_stats = psutil.net_if_stats()
    nic_stats = dict()
    for adapter in net_if_stats:
        if net_if_stats[adapter].isup:
            nic_stats[adapter] = {
                "speed": net_if_stats[adapter].speed,
                "speedUnits": "mbps",
                "address": [addr.address for addr in net_if_addrs[adapter]]
            }

    info = {
        "load": psutil.getloadavg(),
        "cpu": {
            "utilisation": psutil.cpu_percent(0.1),
            "physicalCores": psutil.cpu_count(False),
            "logicalCores": psutil.cpu_count(),
            "frequency": {
                "current": cpu_freq.current,
                "min": cpu_freq.min,
                "max": cpu_freq.max
            }
        },
        "memory": {
            "total": mem.total,
            "available": mem.available,
            "used": mem.total - mem.available
        },
        "swap": {
            "total": swap.total,
            "used": swap.used,
            "percent": swap.percent
        },
        "disks": disk_info,
        "network": {
            "bytesSent": net_io_counters.bytes_sent,
            "bytesRecv": net_io_counters.bytes_recv,
            "packetsSent": net_io_counters.packets_sent,
            "packetsRecv": net_io_counters.packets_recv,
            "adapters": nic_stats
        }
    }
    return rest.response(200, data=info)
