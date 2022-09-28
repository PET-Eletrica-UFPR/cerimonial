import { useRouteError } from 'react-router-dom';


export function Error() {
  const error = useRouteError();
  console.log(error);

  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
    </div>
  );
}
