import { css } from "@emotion/css";
import chroma from "chroma-js";
import ky from "ky";
import { argv } from "process";
import React, { useEffect, useMemo, useState } from "react";
import { useInterval } from "react-use";
import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";

const calcUrl = () => {
  const url = new URL("/result", import.meta.env.VITE_HTTP_ENDPOINT);

  return url.toString();
};

export const Chart: React.FC<{ floors: string[]; plots: any[] }> = ({ plots, floors }) => (
  <ResponsiveContainer width={"100%"} minWidth={1080} height={520}>
    <LineChart data={plots} margin={{ top: 32, right: 64, left: 64, bottom: 32 }}>
      <CartesianGrid
        stroke="#81a1c1"
        strokeDasharray="3 3"
      />
      <XAxis
        dataKey="period"
        stroke="#2e3440"
        color="#d8dee9"
        tick={{ fill: "#4c566a", fontSize: "0.75rem", fontFamily: "sans-serif" }}
      />
      <YAxis
        type="number"
        stroke="#2e3440"
        tick={{ fill: "#4c566a", fontSize: "0.75rem", fontFamily: "sans-serif" }}
        domain={[
          (dataMin: number) => (Math.round(dataMin * 1e1) / 1e1 - 0.25),
          (dataMax: number) => (Math.round(dataMax * 1e1) / 1e1 + 0.25),
        ]}
      />
      <Legend />
      {floors.map((floor, i, { length }) => (
        <Line
          key={floor}
          type="monotone"
          dataKey={floor}
          dot={false}
          isAnimationActive={false}
          stroke={chroma.mix("#bf616a", "#88c0d0", i / (length - 1), "hsl").hex()}
        >
        </Line>
      ))}
    </LineChart>
  </ResponsiveContainer>
);

export const IndexPage: React.FC<{ className?: string }> = ({ className }) => {
  const endpoint = useMemo(() => calcUrl(), []);
  const { data: data, mutate, isValidating } = useSWRImmutable<
    {
      period: string;
      edges: { edges: string[]; floor: number }[];
      plots: { floor: number; avg: number; min: number; max: number; period: string; samples: number }[];
    }[]
  >(endpoint, {});

  const edgesMap = useMemo(
    () =>
      data?.[data.length - 1].edges
        .sort(({ floor: a, floor: b }) => b - a)
        .map(({ floor, edges }) => ({ floor, edges: edges.sort() })),
    [data],
  );
  const chartMap = useMemo(
    () => {
      if (!data) return undefined;
      const plots = data.map(({ period, plots }) => ({
        period: new Date(period).toLocaleString(),
        ...(plots.reduce((p, c) => ({ ...p, [`Floor-${c.floor}`]: c.avg }), {})),
      }));
      const floors = Array.from(
        plots.reduce<Set<string>>(
          (p, c) => Object.keys(c).reduce((p2, k) => k !== "period" ? p2.add(k) : p, p),
          new Set<string>(),
        ),
      ).sort();
      return {
        floors,
        plots,
      };
    },
    [data],
  );

  return (
    <main className={css(className)}>
      {chartMap && <Chart floors={chartMap.floors} plots={chartMap.plots}></Chart>}
      <div
        className={css({ display: "flex", marginTop: "1rem", padding: "0 64px" })}
      >
        <div>
          {edgesMap?.map(({ floor, edges }) => (
            <div key={`floor-${floor}`} className={css({ marginTop: "0.5rem" })}>
              <span
                className={css({
                  color: "#5e81ac",
                  fontSize: "1.25rem",
                  fontFamily: "sans-serif",
                })}
              >
                Floor-{floor}
              </span>
              <div className={css({ marginTop: "0.25rem" })}>
                {edges.map((edge) => (
                  <div key={`edge-${edge}`}>
                    <span
                      className={css({
                        color: "#4c566a",
                        fontFamily: "monospace",
                      })}
                    >
                      {edge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={css({ marginLeft: "2rem" })}>
          <button
            className={css({
              padding: "0.5rem 1rem",
              backgroundColor: "#3b4252",
              color: "#d8dee9",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontFamily: "sans-serif",
              ":disabled": {
                cursor: "progress",
              },
              ":hover": {
                backgroundColor: "#4c566a",
              },
            })}
            onClick={() => mutate()}
            disabled={isValidating}
          >
            Reload
          </button>
        </div>
      </div>
    </main>
  );
};
