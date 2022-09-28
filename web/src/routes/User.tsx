import { useState, useDeferredValue, useMemo, useRef, useEffect } from 'react';

interface Person {
  id: number;
  name: string;
  position: string;
  priority: number;
}

type ServerMessage = {
  type: 'init';
  people: Person[];
} | {
  type: 'add';
  person: Person;
} | {
  type: 'remove';
  id: number;
};

export function User() {
  const [people, setPeople] = useState<Person[]>([]);
  const deferredPeople = useDeferredValue(people);
  const sortedPeople = useMemo(() => {
    const people = [...deferredPeople];
    people.sort((p1, p2) => {
      let v = p1.priority - p2.priority;
      if (v !== 0) return v;
      return p1.name.localeCompare(p2.name);
    });
    return people;
  }, [deferredPeople]);

  const ws = useRef<WebSocket>();
  useEffect(() => {
    ws.current = new WebSocket(`ws://${window.location.hostname}:8080`);

    ws.current.addEventListener('message', ({ data }) => {
      const message: ServerMessage = JSON.parse(data);

      if (message.type === 'init') {
        setPeople(message.people);
      } else if (message.type === 'add') {
        setPeople(people => [...people, message.person]);
      } else if (message.type === 'remove') {
        setPeople(people => people.filter(person => person.id !== message.id));
      }
    });

    return () => {
      ws.current!.close();
    };
  }, []);

  return (
    <div className='bg-purple-200 flex flex-col items-center'>
      <div className='flex flex-col items-stretch p-5 gap-5 w-[32rem]'>
        {sortedPeople.map(person => (
          <div key={person.id} className='flex flex-col justify-between border-purple-800 border-2 p-5 rounded'>
            <p className='text-2xl text-purple-800 font-bold'>{person.name}</p>
            <p className='text-lg text-purple-800 font-semibold'>{person.position}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
