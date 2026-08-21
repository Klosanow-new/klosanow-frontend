import React from "react";

const AccentBar: React.FC<{ full?: boolean }> = ({ full }) => (
  <div className={`sl-bar${full ? " sl-bar--full" : ""}`} />
);

export default AccentBar;
