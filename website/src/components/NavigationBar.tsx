import { tx } from '@twind/core';

function NavigationBar() {
  return (
    <div className={tx`px-[15px] py-[15px] flex bg-[#171f2c] text-white border-b(1 solid [#11161f])`}>
      <h1>TypeJsonEditor</h1>
    </div>
  );
}

export default NavigationBar;
