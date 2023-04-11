import { useState, useRef, useEffect } from 'preact/hooks'
import { useDOMEvent } from './hooks.ts';
import { JSX } from 'preact/jsx-runtime';

export default function Menu<T>({items, presentation}: {
  items: T[],
  presentation: (props: {item: T, selected: boolean})=>any
}) {
    const [tabSelected, setTabSelected] = useState<number>(0);
    const [mouseSelected, setMouseSelected] = useState<number | undefined>(undefined);
    const selected = mouseSelected ?? tabSelected;
    const prevItemsRef = useRef<T[]>(items);
    useEffect(()=>{
      if (JSON.stringify(prevItemsRef.current)!==JSON.stringify(items)) {
        setTabSelected(0)
        prevItemsRef.current = items;
      }
    }, [items])
    useDOMEvent('keydown', (event)=>{
      if (mouseSelected!==undefined) {
        return
      }
      if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
        event.preventDefault()
        // Move focus to the previous button, or cycle back to the last button if at the first
        setTabSelected(prev=>(prev+items.length-1)%items.length);
        return
      }
      if (event.key === 'ArrowDown' || event.key === 'Tab') {
        event.preventDefault()
        // Move focus to the next button, or cycle back to the first button if at the end
        setTabSelected(prev=> (prev + 1) % items.length);
      }
    }, [items, selected, mouseSelected])
    return (
      <div>
        {items.map((item, i) => presentation({item, selected:i===selected}))}
      </div>
    );
  }