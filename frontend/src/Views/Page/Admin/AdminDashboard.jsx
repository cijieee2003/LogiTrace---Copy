
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

import {
  TruckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const DELIVERY_STATUSES = [
  "pending",
  "pick_up",
  "arrival",
  "queuing",
  "unloading",
  "checking",
  "delivered",
];

const INCIDENT_STATUSES = [
  "open",
  "under_review",
  "resolved",
];

const getArray = (response, keys = []) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

const getDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const startOfWeek = (date) => {
  const result = startOfDay(date);
  const day = result.getDay();

  // Monday = 0
  const difference = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - difference);

  return result;
};

const startOfMonth = (date) => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);

  return result;
};

const formatDate = (value) => {
  const date = getDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatShortDate = (value) => {
  const date = getDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatMonth = (value) => {
  const date = getDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
  });
};

const formatDuration = (minutes) => {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return "—";
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = minutes / 60;

  if (hours < 24) {
    return `${hours.toFixed(1)} hrs`;
  }

  return `${(hours / 24).toFixed(1)} days`;
};

const normalizeStatus = (status) => {
  if (!status) return "unknown";

  return String(status)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const getDriverName = (delivery) => {
  if (!delivery) return "Unassigned";

  return (
    delivery.driver?.driver?.first_name
      ? `${delivery.driver.driver.first_name} ${
          delivery.driver.driver.last_name || ""
        }`.trim()
      : delivery.driver?.first_name
      ? `${delivery.driver.first_name} ${
          delivery.driver.last_name || ""
        }`.trim()
      : delivery.driver?.user?.username ||
        delivery.driver?.username ||
        delivery.driver_name ||
        "Unassigned"
  );
};

const getDriverId = (delivery) => {
  return (
    delivery?.driver_id ||
    delivery?.driver?.id ||
    delivery?.driver?.user_id ||
    delivery?.driver?.user?.id ||
    null
  );
};

const getDeliveryCreatedDate = (delivery) => {
  return (
    delivery?.created_at ||
    delivery?.date_created ||
    delivery?.delivery_date ||
    null
  );
};

const getDeliveryCompletedDate = (delivery) => {
  return (
    delivery?.delivered_at ||
    delivery?.completed_at ||
    delivery?.delivery_completed_at ||
    null
  );
};

const getIncidentDate = (incident) => {
  return (
    incident?.reported_at ||
    incident?.created_at ||
    incident?.incident_date ||
    null
  );
};

const getIncidentStage = (incident) => {
  return (
    incident?.delivery?.status ||
    incident?.delivery_status ||
    incident?.stage ||
    incident?.delivery_stage ||
    "unknown"
  );
};

const getDepartment = (incident) => {
  return (
    incident?.classification?.department ||
    incident?.department ||
    "Unassigned"
  );
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const results = await Promise.allSettled([
        axiosClient.get("/staff/deliveries"),
        axiosClient.get("/drivers"),
        axiosClient.get("/incidents"),
      ]);

      const deliveryResult = results[0];
      const driverResult = results[1];
      const incidentResult = results[2];

      if (deliveryResult.status === "fulfilled") {
        setDeliveries(
          getArray(deliveryResult.value, [
            "deliveries",
            "data",
          ])
        );
      }

      if (driverResult.status === "fulfilled") {
        setDrivers(
          getArray(driverResult.value, [
            "drivers",
            "data",
          ])
        );
      }

      if (incidentResult.status === "fulfilled") {
        setIncidents(
          getArray(incidentResult.value, [
            "incidents",
            "data",
          ])
        );
      }

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length === results.length) {
        throw new Error("Unable to load dashboard data.");
      }

      if (failedRequests.length > 0) {
        setError(
          "Some dashboard data could not be loaded. Please check your API connection."
        );
      }
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* =========================================================
     DATE INFORMATION
  ========================================================= */

  const dateInfo = useMemo(() => {
    const now = new Date();

    return {
      now,
      today: startOfDay(now),
      week: startOfWeek(now),
      month: startOfMonth(now),
    };
  }, []);

  /* =========================================================
     DELIVERY KPIs
  ========================================================= */

  const deliveryStats = useMemo(() => {
    const { today, week, month } = dateInfo;

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    deliveries.forEach((delivery) => {
      const date = getDate(getDeliveryCreatedDate(delivery));

      if (!date) return;

      if (date >= today) {
        todayCount++;
      }

      if (date >= week) {
        weekCount++;
      }

      if (date >= month) {
        monthCount++;
      }
    });

    const delivered = deliveries.filter(
      (delivery) =>
        normalizeStatus(delivery.status) === "delivered"
    ).length;

    const pending = deliveries.filter((delivery) => {
      const status = normalizeStatus(delivery.status);

      return (
        status === "pending" ||
        status === "pick_up"
      );
    }).length;

    return {
      total: deliveries.length,
      today: todayCount,
      week: weekCount,
      month: monthCount,
      delivered,
      pending,
    };
  }, [deliveries, dateInfo]);

  /* =========================================================
     INCIDENT KPIs
  ========================================================= */

  const incidentStats = useMemo(() => {
    const open = incidents.filter((incident) => {
      const status = normalizeStatus(incident.status);

      return status === "open";
    }).length;

    const underReview = incidents.filter((incident) => {
      const status = normalizeStatus(incident.status);

      return (
        status === "under_review" ||
        status === "under review"
      );
    }).length;

    const resolved = incidents.filter((incident) => {
      const status = normalizeStatus(incident.status);

      return status === "resolved";
    }).length;

    return {
      total: incidents.length,
      open,
      underReview,
      resolved,
    };
  }, [incidents]);

  /* =========================================================
     DELIVERY TRENDS BY DATE
  ========================================================= */

  const deliveryTrend = useMemo(() => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(dateInfo.now);

      date.setDate(date.getDate() - i);

      const dayStart = startOfDay(date);
      const nextDay = new Date(dayStart);

      nextDay.setDate(nextDay.getDate() + 1);

      const count = deliveries.filter((delivery) => {
        const deliveryDate = getDate(
          getDeliveryCreatedDate(delivery)
        );

        return (
          deliveryDate &&
          deliveryDate >= dayStart &&
          deliveryDate < nextDay
        );
      }).length;

      result.push({
        date: dayStart,
        label: formatShortDate(dayStart),
        count,
      });
    }

    return result;
  }, [deliveries, dateInfo]);

  /* =========================================================
     INCIDENT TRENDS BY DATE
  ========================================================= */

  const incidentTrend = useMemo(() => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(dateInfo.now);

      date.setDate(date.getDate() - i);

      const dayStart = startOfDay(date);
      const nextDay = new Date(dayStart);

      nextDay.setDate(nextDay.getDate() + 1);

      const count = incidents.filter((incident) => {
        const incidentDate = getDate(
          getIncidentDate(incident)
        );

        return (
          incidentDate &&
          incidentDate >= dayStart &&
          incidentDate < nextDay
        );
      }).length;

      result.push({
        date: dayStart,
        label: formatShortDate(dayStart),
        count,
      });
    }

    return result;
  }, [incidents, dateInfo]);

  /* =========================================================
     AVERAGE DELIVERY COMPLETION
  ========================================================= */

  const averageCompletion = useMemo(() => {
    const durations = deliveries
      .filter(
        (delivery) =>
          normalizeStatus(delivery.status) === "delivered"
      )
      .map((delivery) => {
        const created = getDate(
          getDeliveryCreatedDate(delivery)
        );

        const completed = getDate(
          getDeliveryCompletedDate(delivery)
        );

        if (!created || !completed) {
          return null;
        }

        const minutes =
          (completed.getTime() - created.getTime()) /
          (1000 * 60);

        return minutes >= 0 ? minutes : null;
      })
      .filter((value) => value !== null);

    if (durations.length === 0) {
      return {
        minutes: null,
        display: "—",
        sampleSize: 0,
      };
    }

    const average =
      durations.reduce((sum, value) => sum + value, 0) /
      durations.length;

    return {
      minutes: average,
      display: formatDuration(average),
      sampleSize: durations.length,
    };
  }, [deliveries]);

  /* =========================================================
     DRIVER PERFORMANCE
  ========================================================= */

  const driverPerformance = useMemo(() => {
    const map = new Map();

    drivers.forEach((driver) => {
      const id =
        driver.id ||
        driver.user_id ||
        driver.user?.id;

      if (!id) return;

      const firstName =
        driver.first_name ||
        driver.user?.first_name ||
        "";

      const lastName =
        driver.last_name ||
        driver.user?.last_name ||
        "";

      const name =
        `${firstName} ${lastName}`.trim() ||
        driver.username ||
        driver.user?.username ||
        `Driver #${id}`;

      map.set(String(id), {
        id,
        name,
        total: 0,
        delivered: 0,
        active: 0,
        incidents: 0,
        completionMinutes: [],
      });
    });

    deliveries.forEach((delivery) => {
      const driverId = getDriverId(delivery);

      if (!driverId) return;

      const key = String(driverId);

      if (!map.has(key)) {
        map.set(key, {
          id: driverId,
          name: getDriverName(delivery),
          total: 0,
          delivered: 0,
          active: 0,
          incidents: 0,
          completionMinutes: [],
        });
      }

      const item = map.get(key);

      item.total++;

      const status = normalizeStatus(delivery.status);

      if (status === "delivered") {
        item.delivered++;

        const created = getDate(
          getDeliveryCreatedDate(delivery)
        );

        const completed = getDate(
          getDeliveryCompletedDate(delivery)
        );

        if (created && completed) {
          const minutes =
            (completed.getTime() - created.getTime()) /
            (1000 * 60);

          if (minutes >= 0) {
            item.completionMinutes.push(minutes);
          }
        }
      }

      if (status !== "delivered") {
        item.active++;
      }
    });

    incidents.forEach((incident) => {
      const driverId =
        incident?.delivery?.driver_id ||
        incident?.driver_id ||
        incident?.delivery?.driver?.id;

      if (!driverId) return;

      const item = map.get(String(driverId));

      if (item) {
        item.incidents++;
      }
    });

    return Array.from(map.values())
      .map((item) => {
        const completionRate =
          item.total > 0
            ? (item.delivered / item.total) * 100
            : 0;

        const avgMinutes =
          item.completionMinutes.length > 0
            ? item.completionMinutes.reduce(
                (sum, value) => sum + value,
                0
              ) / item.completionMinutes.length
            : null;

        return {
          ...item,
          completionRate,
          avgMinutes,
          avgCompletion: formatDuration(avgMinutes),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [drivers, deliveries, incidents]);

  /* =========================================================
     MOST ACTIVE DRIVERS
  ========================================================= */

  const mostActiveDrivers = useMemo(() => {
    return [...driverPerformance]
      .sort((a, b) => {
        if (b.active !== a.active) {
          return b.active - a.active;
        }

        return b.total - a.total;
      })
      .slice(0, 5);
  }, [driverPerformance]);

  /* =========================================================
     DELIVERIES PER DRIVER
  ========================================================= */

  const deliveriesPerDriver = useMemo(() => {
    return [...driverPerformance]
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [driverPerformance]);

  /* =========================================================
     INCIDENTS PER DELIVERY STAGE
  ========================================================= */

  const incidentsPerStage = useMemo(() => {
    const map = {};

    DELIVERY_STATUSES.forEach((status) => {
      map[status] = 0;
    });

    incidents.forEach((incident) => {
      const stage = normalizeStatus(
        getIncidentStage(incident)
      );

      if (!map[stage]) {
        map[stage] = 0;
      }

      map[stage]++;
    });

    return Object.entries(map).filter(
      ([, count]) => count > 0
    );
  }, [incidents]);

  /* =========================================================
     INCIDENTS BY DEPARTMENT
  ========================================================= */

  const incidentsByDepartment = useMemo(() => {
    const map = {};

    incidents.forEach((incident) => {
      const department = getDepartment(incident);

      if (!map[department]) {
        map[department] = 0;
      }

      map[department]++;
    });

    return Object.entries(map)
      .map(([department, count]) => ({
        department,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [incidents]);

  /* =========================================================
     MONTHLY DELIVERY STATISTICS
  ========================================================= */

  const monthlyStatistics = useMemo(() => {
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(dateInfo.now);

      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const monthStart = new Date(date);
      const nextMonth = new Date(date);

      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const created = deliveries.filter((delivery) => {
        const deliveryDate = getDate(
          getDeliveryCreatedDate(delivery)
        );

        return (
          deliveryDate &&
          deliveryDate >= monthStart &&
          deliveryDate < nextMonth
        );
      }).length;

      const delivered = deliveries.filter((delivery) => {
        const deliveryDate = getDate(
          getDeliveryCreatedDate(delivery)
        );

        return (
          deliveryDate &&
          deliveryDate >= monthStart &&
          deliveryDate < nextMonth &&
          normalizeStatus(delivery.status) === "delivered"
        );
      }).length;

      const pending = deliveries.filter((delivery) => {
        const deliveryDate = getDate(
          getDeliveryCreatedDate(delivery)
        );

        const status = normalizeStatus(delivery.status);

        return (
          deliveryDate &&
          deliveryDate >= monthStart &&
          deliveryDate < nextMonth &&
          (status === "pending" ||
            status === "pick_up")
        );
      }).length;

      result.push({
        month: formatMonth(monthStart),
        created,
        delivered,
        pending,
      });
    }

    return result;
  }, [deliveries, dateInfo]);

  /* =========================================================
     MAX VALUES FOR CHARTS
  ========================================================= */

  const maxDeliveryTrend = Math.max(
    ...deliveryTrend.map((item) => item.count),
    1
  );

  const maxIncidentTrend = Math.max(
    ...incidentTrend.map((item) => item.count),
    1
  );

  const maxDriverDeliveries = Math.max(
    ...deliveriesPerDriver.map((item) => item.total),
    1
  );

  const maxDepartmentIncidents = Math.max(
    ...incidentsByDepartment.map((item) => item.count),
    1
  );

  const maxStageIncidents = Math.max(
    ...incidentsPerStage.map(([, count]) => count),
    1
  );

  /* =========================================================
     HELPERS
  ========================================================= */

  const getStatusLabel = (status) => {
    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700";

      case "pending":
        return "bg-amber-100 text-amber-700";

      case "pick_up":
        return "bg-blue-100 text-blue-700";

      case "arrival":
        return "bg-indigo-100 text-indigo-700";

      case "queuing":
        return "bg-purple-100 text-purple-700";

      case "unloading":
        return "bg-orange-100 text-orange-700";

      case "checking":
        return "bg-cyan-100 text-cyan-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getIncidentStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "resolved":
        return "bg-emerald-100 text-emerald-700";

      case "under_review":
        return "bg-amber-100 text-amber-700";

      case "open":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const recentDeliveries = useMemo(() => {
    return [...deliveries]
      .sort((a, b) => {
        const dateA = getDate(
          getDeliveryCreatedDate(a)
        );

        const dateB = getDate(
          getDeliveryCreatedDate(b)
        );

        return (
          (dateB?.getTime() || 0) -
          (dateA?.getTime() || 0)
        );
      })
      .slice(0, 6);
  }, [deliveries]);

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort((a, b) => {
        const dateA = getDate(
          getIncidentDate(a)
        );

        const dateB = getDate(
          getIncidentDate(b)
        );

        return (
          (dateB?.getTime() || 0) -
          (dateA?.getTime() || 0)
        );
      })
      .slice(0, 6);
  }, [incidents]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

         <p className="text-sm text-gray-500">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#17375E] p-3 text-white shadow-sm">
                <ChartBarIcon className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                  Admin Dashboard
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  LogiTrace delivery management and analytics overview.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-500 shadow-sm">
              <CalendarDaysIcon className="h-5 w-5" />

              <span>
                {dateInfo.now.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

           
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Dashboard warning
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            MAIN KPI GRID
        ====================================================== */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Deliveries Today */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Deliveries Today
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {deliveryStats.today}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <TruckIcon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Created since midnight
            </p>
          </div>

          {/* Deliveries This Week */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Deliveries This Week
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {deliveryStats.week}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <CalendarDaysIcon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Monday to today
            </p>
          </div>

          {/* Deliveries This Month */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Deliveries This Month
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {deliveryStats.month}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <ArrowTrendingUpIcon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              From the first day of this month
            </p>
          </div>

          {/* Total Deliveries */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Deliveries
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {deliveryStats.total}
                </p>
              </div>

              <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              All delivery records
            </p>
          </div>

          {/* Delivered */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Delivered
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {deliveryStats.delivered}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Completed deliveries
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Deliveries
                </p>

                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {deliveryStats.pending}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <ClockIcon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Waiting for driver action
            </p>
          </div>

          {/* Incidents */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Incidents
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {incidentStats.total}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              All reported incidents
            </p>
          </div>

          {/* Drivers */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Drivers
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {drivers.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <UserGroupIcon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Registered drivers
            </p>
          </div>
        </div>

        {/* =====================================================
            DELIVERY & INCIDENT TRENDS
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Delivery Trend */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Delivery Trends by Date
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Deliveries created during the last 7 days
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <ArrowTrendingUpIcon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex h-64 items-end gap-2 sm:gap-4">
              {deliveryTrend.map((item) => {
                const height =
                  item.count === 0
                    ? 4
                    : Math.max(
                        (item.count / maxDeliveryTrend) * 100,
                        8
                      );

                return (
                  <div
                    key={item.label}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="mb-2 text-center text-xs font-semibold text-gray-600">
                      {item.count}
                    </div>

                    <div
                      className="rounded-t-lg bg-[#17375E] transition-all hover:bg-[#24598F]"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${item.label}: ${item.count} deliveries`}
                    />

                    <div className="mt-3 text-center text-[10px] text-gray-400 sm:text-xs">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Trend */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Incident Trends by Date
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Incidents reported during the last 7 days
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex h-64 items-end gap-2 sm:gap-4">
              {incidentTrend.map((item) => {
                const height =
                  item.count === 0
                    ? 4
                    : Math.max(
                        (item.count / maxIncidentTrend) * 100,
                        8
                      );

                return (
                  <div
                    key={item.label}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="mb-2 text-center text-xs font-semibold text-gray-600">
                      {item.count}
                    </div>

                    <div
                      className="rounded-t-lg bg-red-500 transition-all hover:bg-red-600"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${item.label}: ${item.count} incidents`}
                    />

                    <div className="mt-3 text-center text-[10px] text-gray-400 sm:text-xs">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =====================================================
            AVERAGE COMPLETION + INCIDENT SUMMARY
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* Average Completion */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <ClockIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Average Delivery Completion
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {averageCompletion.display}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Based on {averageCompletion.sampleSize} completed
              deliveries with available timestamps.
            </p>
          </div>

          {/* Open */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Open Incidents
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {incidentStats.open}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-red-500"
                style={{
                  width: `${
                    incidentStats.total
                      ? Math.min(
                          (incidentStats.open /
                            incidentStats.total) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Under Review */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Under Review
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {incidentStats.underReview}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{
                  width: `${
                    incidentStats.total
                      ? Math.min(
                          (incidentStats.underReview /
                            incidentStats.total) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Resolved */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Resolved Incidents
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {incidentStats.resolved}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${
                    incidentStats.total
                      ? Math.min(
                          (incidentStats.resolved /
                            incidentStats.total) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            DRIVER PERFORMANCE
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Driver Performance */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Driver Performance
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Delivery activity and completion rate
                </p>
              </div>

              <UserGroupIcon className="h-6 w-6 text-gray-400" />
            </div>

            {driverPerformance.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No driver performance data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Driver
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Deliveries
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Delivered
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Rate
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {driverPerformance.slice(0, 8).map((driver) => (
                      <tr
                        key={driver.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17375E] text-sm font-bold text-white">
                              {driver.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {driver.name}
                              </p>

                              <p className="text-xs text-gray-400">
                                {driver.avgCompletion}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                          {driver.total}
                        </td>

                        <td className="px-5 py-4 text-center text-sm font-semibold text-emerald-600">
                          {driver.delivered}
                        </td>

                        <td className="px-5 py-4">
                          <div className="min-w-[100px]">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-gray-400">
                                Completion
                              </span>

                              <span className="font-semibold text-gray-700">
                                {driver.completionRate.toFixed(0)}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(
                                    driver.completionRate,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Most Active Drivers */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Most Active Drivers
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Drivers with the most active deliveries
                </p>
              </div>

              <TruckIcon className="h-6 w-6 text-gray-400" />
            </div>

            <div className="mt-6 space-y-5">
              {mostActiveDrivers.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  No driver activity available.
                </p>
              ) : (
                mostActiveDrivers.map((driver, index) => (
                  <div key={driver.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {index + 1}
                        </div>

                        <span className="text-sm font-semibold text-gray-700">
                          {driver.name}
                        </span>
                      </div>

                      <span className="text-sm font-bold text-[#17375E]">
                        {driver.active} active
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#17375E]"
                        style={{
                          width: `${
                            maxDriverDeliveries
                              ? (driver.active /
                                  maxDriverDeliveries) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            DELIVERIES PER DRIVER + INCIDENT STAGE
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">

          {/* Deliveries Per Driver */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Deliveries per Driver
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Total assigned deliveries
                </p>
              </div>

              <UserGroupIcon className="h-6 w-6 text-gray-400" />
            </div>

            <div className="mt-6 space-y-4">
              {deliveriesPerDriver.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  No assigned deliveries.
                </p>
              ) : (
                deliveriesPerDriver.map((driver) => (
                  <div key={driver.id}>
                    <div className="mb-1.5 flex justify-between">
                      <span className="truncate pr-3 text-sm font-medium text-gray-700">
                        {driver.name}
                      </span>

                      <span className="text-sm font-bold text-gray-800">
                        {driver.total}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${
                            (driver.total /
                              maxDriverDeliveries) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incidents Per Stage */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Incidents per Delivery Stage
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Where incidents are being reported
                </p>
              </div>

              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            </div>

            <div className="mt-6 space-y-4">
              {incidentsPerStage.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  No incident stage data available.
                </p>
              ) : (
                incidentsPerStage.map(([stage, count]) => (
                  <div key={stage}>
                    <div className="mb-1.5 flex justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusLabel(stage)}
                      </span>

                      <span className="text-sm font-bold text-gray-800">
                        {count}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width: `${
                            (count /
                              maxStageIncidents) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incidents By Department */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Incidents by Department
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Departments receiving incident reports
                </p>
              </div>

              <BuildingOffice2Icon className="h-6 w-6 text-gray-400" />
            </div>

            <div className="mt-6 space-y-4">
              {incidentsByDepartment.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  No department data available.
                </p>
              ) : (
                incidentsByDepartment.map(
                  ({ department, count }) => (
                    <div key={department}>
                      <div className="mb-1.5 flex justify-between">
                        <span className="truncate pr-3 text-sm font-medium text-gray-700">
                          {department}
                        </span>

                        <span className="text-sm font-bold text-gray-800">
                          {count}
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{
                            width: `${
                              (count /
                                maxDepartmentIncidents) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            MONTHLY DELIVERY STATISTICS
        ====================================================== */}

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Monthly Delivery Statistics
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Delivery activity for the last six months
              </p>
            </div>

            <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[650px]">
              <div className="grid grid-cols-4 border-b border-gray-100 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <span>Month</span>
                <span className="text-center">
                  Created
                </span>
                <span className="text-center">
                  Delivered
                </span>
                <span className="text-center">
                  Pending
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {monthlyStatistics.map((item) => (
                  <div
                    key={item.month}
                    className="grid grid-cols-4 py-4 text-sm"
                  >
                    <span className="font-semibold text-gray-700">
                      {item.month}
                    </span>

                    <span className="text-center font-semibold text-[#17375E]">
                      {item.created}
                    </span>

                    <span className="text-center font-semibold text-emerald-600">
                      {item.delivered}
                    </span>

                    <span className="text-center font-semibold text-amber-600">
                      {item.pending}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RECENT DELIVERIES + INCIDENTS
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Recent Deliveries */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Recent Deliveries
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Latest delivery records
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/delivery")
                }
                className="text-sm font-semibold text-[#17375E] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentDeliveries.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  No deliveries available.
                </div>
              ) : (
                recentDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                        <TruckIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {delivery.dr_number ||
                            delivery.delivery_number ||
                            delivery.reference_number ||
                            `Delivery #${delivery.id}`}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {getDriverName(delivery)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                          delivery.status
                        )}`}
                      >
                        {getStatusLabel(
                          delivery.status
                        )}
                      </span>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {formatDate(
                          getDeliveryCreatedDate(
                            delivery
                          )
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Recent Incidents
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Latest reported incidents
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/incidents")
                }
                className="text-sm font-semibold text-[#17375E] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentIncidents.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  No incidents available.
                </div>
              ) : (
                recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {incident.incident_number ||
                            `INC-${incident.id}`}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {incident.classification
                            ?.incident_type ||
                            incident.incident_type ||
                            "Incident"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getIncidentStatusClass(
                          incident.status
                        )}`}
                      >
                        {getStatusLabel(
                          incident.status
                        )}
                      </span>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {formatDate(
                          getIncidentDate(incident)
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Frequently used administration functions
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <button
              type="button"
              onClick={() =>
                navigate("/admin/registerdriver")
              }
              className="group flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#17375E] hover:bg-gray-50"
            >
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-100">
                <UserPlusIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  Register Driver
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Create a new driver account
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/driver")
              }
              className="group flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#17375E] hover:bg-gray-50"
            >
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-100">
                <UserGroupIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  Driver Management
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  View and manage drivers
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/delivery")
              }
              className="group flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#17375E] hover:bg-gray-50"
            >
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 group-hover:bg-emerald-100">
                <TruckIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  Delivery Management
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  View delivery records
                </p>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;

