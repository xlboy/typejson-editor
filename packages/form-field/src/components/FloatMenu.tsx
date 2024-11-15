import { apply, css, tx } from '../utils/twind';
import { AppstoreOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';

export interface FloatMenuProps {
  loadingText: string | null | undefined;
  menuItems: NonNullable<MenuProps['items']>;
}

function FloatMenu({ menuItems, loadingText }: FloatMenuProps) {
  const withLoader = (children: React.ReactNode) => {
    return (
      <div className={tx(apply.loaderWrapper`absolute right-20 bottom-20 z-10 p-2`)}>
        <div
          className={tx(
            apply`absolute size-full rounded-full left-0 top-0 overflow-hidden`,
          )}
        >
          <div
            className={tx(
              apply.loader(
                'size-[200px] absolute left-1/2 top-1/2',
                loadingText ? 'block' : 'hidden',
                css`
                  background: radial-gradient(circle at 30% 30%, #ff0000, transparent 50%),
                    radial-gradient(circle at 70% 70%, #00ff00, transparent 50%),
                    radial-gradient(circle at 50% 50%, #0000ff, transparent 50%),
                    radial-gradient(circle at 80% 20%, #ff00ff, transparent 50%);
                  transform: translate(-50%, -50%);
                  animation: spinCenter 1.5s infinite linear;
                  @keyframes spinCenter {
                    0% {
                      transform: translate(-50%, -50%) rotate(0deg);
                    }
                    100% {
                      transform: translate(-50%, -50%) rotate(360deg);
                    }
                  }
                `,
              ),
            )}
          />
        </div>
        <div
          className={tx(
            apply.bodyWrapper`relative flex items-center justify-center rounded-full bg-black`,
          )}
        >
          {loadingText ? (
            <div className={tx(apply.body('text-white/70 mx-8'))}>{loadingText}</div>
          ) : null}
          {children}
        </div>
      </div>
    );
  };
  const menuButtonJsx = (
    <div
      className={tx(
        apply.menuButton(
          'flex items-center justify-center shadow rounded-full p-5 cursor-pointer',
          'text-zinc-400 hover:(text-gray-600 shadow-gray/50)',
          'backdrop-blur-lg bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent duration-700',
        ),
      )}
    >
      <Dropdown menu={{ items: menuItems }} trigger={['hover']}>
        <AppstoreOutlined className={tx`text-[20px]`} />
      </Dropdown>
    </div>
  );

  return withLoader(menuButtonJsx);
}

export default FloatMenu;
