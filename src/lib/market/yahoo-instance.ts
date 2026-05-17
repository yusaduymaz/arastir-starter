// yahoo-finance2 v3 singleton — instantiate once and share across all modules.
import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance();
export default yf;
