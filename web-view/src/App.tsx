import { css } from "@emotion/css";
import ky from "ky";
import React from "react";
import { SWRConfig } from "swr";
import { IndexPage } from "~/pages/IndexPage";

export const App: React.FC = () => {
  return (
    <SWRConfig value={{ fetcher: (res, init) => ky.get(res, init).then((res) => res.json()) }}>
      <IndexPage
        className={css({ minHeight: "100vh", backgroundColor: "#d8dee9" })}
      />
    </SWRConfig>
  );
};
