export default function Welcome(props){
    props.navbar(true);
    return (
        <div className="app-wrapper">
          <Header />
          <style jsx global>{`
            .app-wrapper {
              font-size: 12px;
            }
          `}</style>
        </div>
      )
}

const Header = () => {
  return (
    <header>
      <div className="intro-logo jumbo-bg">
        <h1>Welcome to the new Submit system</h1>
        <br></br>
        <br></br>
        <br></br>
        <br></br>

        <h3> Submit your assignments and test them in a remote machine easily</h3>
        {/* <div className="intro-button">
          <a href="/courses">Go to my courses</a>
        </div> */}
      </div>

      <style jsx>{`
        header {
          margin-bottom: 1rem;
          height: 100vh;
        }
        .intro-logo {
          display: flex;
          position: absolute;
          top: 5em;
          bottom: 8;
          left: 8;
          right: 8;
          flex-direction: column;
          justify-content: space-evenly;
          align-items: center;
          text-align: center;
        }

        .intro-logo h1 {
          font-size: 1.8em;
          font-weight: 900;
          font-family: 'Philosopher', sans-serif;
          color: black;
        }
        @media (min-width: 768px) {
          .intro-logo h1 {
            font-size: 3.5em;
          }
        }
        .intro-logo h3 {
          font-size: 1rem;
          font-weight: 300;
          color: grey;
          margin-bottom: 3em;
        }
        .intro-button {
          margin-top: 2.3em;
          margin-bottom: 3em;
        }
        .intro-button a {
          padding: 0.65em 2.6em;
          border-radius: 20px;
          color: grey;
          border: 1.8px solid grey;
          background: white;
          transition: all 0.5s;
        }

      `}</style>
    </header>
  )
}

