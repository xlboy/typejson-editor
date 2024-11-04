import { AntDesignExportOutlined, CibGithub } from './icons';
import { apply } from '@twind/core';

function NavigationBar() {
  return (
    <div
      className={apply.navBar`px-[15px] py-[15px] flex bg-[#171f2c] text-white border(b solid [#11161f]) flex justify-between`}
    >
      <h1 className={apply.title`text-[20px] font-bold`}>TypeJsonEditor</h1>
      <div
        className={apply.right(
          'flex items-center gap-x-[12px]',
          '[&>*]:(text([#666] [20px] hover:[#888]) cursor-pointer)',
        )}
      >
        <AntDesignExportOutlined />
        <a href="https://github.com/xlboy/typejson-editor" target="_blank" rel="noreferrer">
          <CibGithub />
        </a>
      </div>
    </div>
  );
}

export default NavigationBar;
