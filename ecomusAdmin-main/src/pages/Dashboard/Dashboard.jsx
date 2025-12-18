import React, { useMemo } from "react";
import img1 from "../../assets/Ellipse 27.png";
import img2 from "../../assets/Ellipse 28.png";
import img3 from "../../assets/Ellipse 29.png";
import img4 from "../../assets/Western union.png";
import Breadcupdash from "../../components/Breadcupdash";
import { useCountinfoQuery } from "../../store/api/webinfoapi";
import { useGetOrderAnalyticsQuery } from "../../store/api/orderapi";
import Loadercomp from "../../components/Loadercomp";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CATEGORY_COLORS = ["#00b894", "#0984e3", "#fdcb6e", "#e17055", "#6c5ce7", "#00cec9", "#d63031"];

const formatCurrencyTick = (value) => {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 10000000) {
    const formatted = value / 10000000;
    return `₹${Number.isInteger(formatted) ? formatted : formatted.toFixed(1)}Cr`;
  }

  if (absoluteValue >= 100000) {
    const formatted = value / 100000;
    return `₹${Number.isInteger(formatted) ? formatted : formatted.toFixed(1)}L`;
  }

  if (absoluteValue >= 1000) {
    const formatted = value / 1000;
    return `₹${Number.isInteger(formatted) ? formatted : formatted.toFixed(1)}K`;
  }

  return `₹${value}`;
};

const Dashboard = () => {
  const { data, isLoading } = useCountinfoQuery();
  const { data: analyticsData, isLoading: analyticsLoading } = useGetOrderAnalyticsQuery({ days: 7 });

  const isDashboardLoading = isLoading || analyticsLoading;

  const safeData = {
    user: data?.user ?? 0,
    category: data?.category ?? 0,
    order: data?.order ?? 0,
    latestUsers: Array.isArray(data?.latestUsers) ? data.latestUsers : [],
    latestOrders: Array.isArray(data?.latestOrders) ? data.latestOrders : [],
  };

  const salesChartData = useMemo(() => {
    const list = analyticsData?.dayWiseSales ?? [];
    return list.map((entry) => ({
      ...entry,
      label: entry.date ? entry.date.slice(5) : "",
    }));
  }, [analyticsData]);

  const ordersChartData = useMemo(() => {
    const list = analyticsData?.dayWiseOrders ?? [];
    return list.map((entry) => ({
      ...entry,
      label: entry.date ? entry.date.slice(5) : "",
    }));
  }, [analyticsData]);

  const userChartData = useMemo(() => {
    const list = analyticsData?.cumulativeUsers ?? [];
    return list.map((entry) => ({
      ...entry,
      label: entry.date ? entry.date.slice(5) : "",
    }));
  }, [analyticsData]);

  const categoryChartData = useMemo(() => analyticsData?.topCategories ?? [], [analyticsData]);

  const categoryPieData = useMemo(
    () =>
      categoryChartData
        .map((item) => ({ name: item.name, value: Number(item.totalQuantity || 0) }))
        .filter((entry) => entry.value > 0),
    [categoryChartData]
  );

  if (isDashboardLoading) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loadercomp size={70} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      {/* <Header /> */}
      <div className="dashboardcontent">
        <Breadcupdash name={"Dashboard"} />
        <div className="container-fuild py-4" style={{ paddingLeft: "0px", paddingRight: "0px" }}>
          <div className="row">
            <div className="col-lg-4 mb-2 col-md-6 col-12 dbox">
              <div className="row bg-white py-3 d-flex align-items-center rounded py-2">
                <div className="col-3">
                  <img src={img1} alt="" />
                </div>
                <div className="col-9">
                  <p className="dbold">{safeData.user}</p>
                  <p className="pbold">Total Customer</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 mb-2 col-md-6 col-12 dbox">
              <div className="row bg-white py-3 d-flex align-items-center rounded py-2">
                <div className="col-3">
                  <img src={img2} width='63px' alt="" />
                </div>
                <div className="col-9">
                  <p className="dbold">{safeData.category}</p>
                  <p className="pbold">Total Categorys</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4  mb-2 col-md-6 col-12 dbox">
              <div className="row bg-white py-3 d-flex align-items-center rounded py-2">
                <div className="col-3">
                  <img src={img3} width="63px" alt="" />
                </div>
                <div className="col-9">
                  <p className="dbold">{safeData.order}</p>
                  <p className="pbold">Total Orders</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-3 mx-1">
            <div className="col-lg-6 col-12 mb-3">
              <div className="bg-white rounded dbox p-3 h-100">
                <div className="dtext pb-2">Day-wise Sales (₹)</div>
                <div className="underline mb-3"></div>
                {salesChartData.length === 0 ? (
                  <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                    No sales data available for the selected range.
                  </p>
                ) : (
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={salesChartData}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059fe2" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#059fe2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis tickFormatter={formatCurrencyTick} />
                        <Tooltip
                          formatter={(value) => [`₹${Number(value || 0).toLocaleString()}`, "Sales"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area type="monotone" dataKey="totalSales" stroke="#059fe2" fill="url(#salesArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-6 col-12 mb-3">
              <div className="bg-white rounded dbox p-3 h-100">
                <div className="dtext pb-2">Day-wise Orders</div>
                <div className="underline mb-3"></div>
                {ordersChartData.length === 0 ? (
                  <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                    No orders recorded in the selected range.
                  </p>
                ) : (
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={ordersChartData}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          formatter={(value) => [Number(value || 0).toLocaleString(), "Orders"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend verticalAlign="top" height={32} />
                        <Line
                          type="monotone"
                          dataKey="totalOrders"
                          stroke="#ff9f43"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Total Orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="row mt-3 mx-1">
            <div className="col-lg-8 col-12 mb-3">
              <div className="bg-white rounded dbox p-3 h-100">
                <div className="dtext pb-2">Cumulative Customers</div>
                <div className="underline mb-3"></div>
                {userChartData.length === 0 ? (
                  <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                    No customer registrations captured in the selected range.
                  </p>
                ) : (
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={userChartData}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="userArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          formatter={(value) => [Number(value || 0).toLocaleString(), "Customers"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area type="monotone" dataKey="totalUsers" stroke="#27ae60" fill="url(#userArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-4 col-12 mb-3">
              <div className="bg-white rounded dbox p-3 h-100">
                <div className="dtext pb-2">Top Selling Categories</div>
                <div className="underline mb-3"></div>
                {categoryPieData.length === 0 ? (
                  <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                    No category sales captured yet.
                  </p>
                ) : (
                  <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={95}
                          paddingAngle={4}
                          stroke="#ffffff"
                          strokeWidth={1}
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell
                              key={`slice-${entry.name}`}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${Number(value || 0).toLocaleString()} units`, name]}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="row mt-3 mx-1">
            <div className="col-lg-6 col-12 dbox rounded my-lg-0 my-2 bg-white specailshow">
              <div className="row">
                <div className="col-12 dtext py-2">10 Latest Customer</div>
                <div className="col-12 px-2 ">
                  {" "}
                  <div className="underline"></div>
                </div>
              </div>
              <div className="headtb special">
                <div className="sno" style={{ position: 'relative', left: '8px' }}>Full Name</div>
                <div className="companylogo">Mobile</div>
                <div className="amount">Email</div>
              </div>
              {safeData.latestUsers.map((item, index) => (
                <div className="headtb ">
                  <div className="sno px-3">{`${item.first_name} ${item.last_name}`}</div>
                  <div className="">
                    {item.mobile}
                  </div>
                  <div className="amount">{item.email}</div>
                </div>
              ))}

            </div>
            <div className="col-lg-6 col-12 dbox">
              <div className="row rounded bg-white ">
                <div className="col-12 d-flex justify-content-between">
                  <div className="dtext py-2">10 Latest Orders</div>
                  <div className="lastlo d-flex py-2" style={{ gap: "7px" }}>
                  </div>
                </div>
                <div className="col-12 px-2 ">
                  {" "}
                  <div className="underline"></div>
                </div>
                <div className="headtb special">
                  <div className="sno" style={{ position: 'relative', left: '20px' }}>Order ID</div>
                  <div className="companylogo" style={{ position: 'relative', left: '50px' }}>Order Status</div>
                  <div className="amount">Amount</div>
                </div>

                {safeData.latestOrders.map((item, index) => (
                  <div className="headtb">
                    <div className="sno px-3">{item.orderid}</div>
                    <div className="companylogo">
                      {item.order_status}
                    </div>
                    <div className="amount">₹{item.grand_total_amount}</div>
                  </div>
                ))}


              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
