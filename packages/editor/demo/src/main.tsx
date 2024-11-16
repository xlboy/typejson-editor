import Editor from './Editor';
import FormItem from './FormItem';
import Json5Editor from './Json5Editor';
import './libs/twind';
import { createRoot } from 'react-dom/client';

// createRoot(document.getElementById('root')!).render(<Editor />);
createRoot(document.getElementById('root')!).render(<FormItem />);
// createRoot(document.getElementById('root')!).render(<Json5Editor />);
