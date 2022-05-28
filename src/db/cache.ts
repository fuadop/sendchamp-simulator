import NodeCache from "node-cache";

const cache = new NodeCache({ checkperiod: 0 });
export default cache;
