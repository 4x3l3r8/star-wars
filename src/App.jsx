import axios from "axios";
import MaterialReactTable from "material-react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Loader from "./components/Loader";
import { ReactComponent as StarWars } from "./SW.svg";

function App() {
  // initialise states
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [films, setFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [fetchedMovieDeets, setFetchedMovieDeets] = useState(null);
  const [fetchedCharacterDeets, setFetchedCharacterDeets] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [totalHeights, setTotalHeights] = useState(0);
  const [muted, setMuted] = useState(false);

  // initialise refs
  const section2Ref = useRef();
  const footerRef = useRef();
  const modal = useRef();

  // modal close function
  const modalClose = () => {
    modal.current.classList.remove("animate-fadeIn");
    modal.current.classList.add("animate-fadeOut");
    setTimeout(() => {
      modal.current.style.display = "none";
    }, 500);
  };

  // modal open function
  const openModal = () => {
    modal.current.classList.remove("animate-fadeOut");
    modal.current.classList.add("animate-fadeIn");
    modal.current.style.display = "flex";
  };

  /**
   *Converts length in 'cm' to 'ft/In'
   * @param {Number} n number to be converted in cm
   * @returns converted number in ft/In
   */
  const convertToFeetPerInches = (n) => {
    var realFeet = (n * 0.3937) / 12;
    var feet = Math.floor(realFeet);
    var inches = Math.round((realFeet - feet) * 12);
    return feet + "ft/" + inches + "in";
  };

  // handle optional audio mute
  const muteAudio = () => {
    setMuted(!muted);
  };

  // run on load/mount of page
  useEffect(() => {
    // load films
    const loadFilms = async () => {
      setLoading(true);
      const api = process.env.REACT_APP_API_URL;
      await axios
        .get(api + "films")
        .then((res) => {
          setFilms(res.data.results?.sort((a, b) => new Date(a.release_date) - new Date(b.release_date)));
        })
        .catch((err) => setError(err));
      setLoading(false);
    };

    // Gets random x, y values based on the size of the container
    const getRandomPosition = () => {
      var y = window.innerWidth;
      var x = window.innerHeight;
      var randomX = Math.floor(Math.random() * x);
      var randomY = Math.floor(Math.random() * y);
      return [randomX, randomY];
    };

    //BG space effect
    const bGEffect = () => {
      // Sets the number of stars we wish to display
      const numStars = 100;

      const app = document.getElementById("body");

      // For every star we want to display
      for (let i = 0; i < numStars; i++) {
        let star = document.createElement("div");
        star.className = "star";
        var xy = getRandomPosition();
        star.style.top = xy[0] + "px";
        star.style.left = xy[1] + "px";
        // document.body.append(star);
        app.append(star);
      }
    };

    bGEffect();
    loadFilms();
  }, []);

  // run when a movie has been selected from the dropdown(get movie data from API)
  useEffect(() => {
    // Auto scroll on select of film
    if (section2Ref.current) {
      section2Ref.current.scrollTop += 500;
    }

    // fetch movie details
    if (selectedFilm) {
      const fetchMovieDeets = async () => {
        setLoading(true);
        await axios
          .get(selectedFilm.url)
          .then((res) => {
            setFetchedMovieDeets(res.data);
          })
          .catch((err) => setError(err));
        setLoading(false);
      };

      fetchMovieDeets();
      // fetchMovieCharacterDeets();
    }

    // fetch movie character details
  }, [selectedFilm]);

  // get character details when a movie has been selected(API fetch)
  useEffect(() => {
    if (fetchedMovieDeets) {
      const fetchMovieCharacterDeets = async () => {
        setLoading(true);
        const characters = await Promise.all(
          fetchedMovieDeets?.characters.map((characterUrl) => {
            return axios.get(characterUrl).then((res) => {
              return res.data;
            });
          })
        );

        setFetchedCharacterDeets(characters);
        setLoading(false);
      };

      fetchMovieCharacterDeets();
    }
  }, [fetchedMovieDeets]);

  // get, compute and set characters' heights in table footer
  useEffect(() => {
    if (currentPageData.length > 0 && footerRef.current !== null) {
      let getTotalHeight = 0;
      let unknown = 0;

      currentPageData.forEach((row) => {
        // eslint-disable-next-line use-isnan, eqeqeq
        if (row.original.height === "unknown") {
          unknown++;
        } else {
          getTotalHeight += Number(row.original.height);
        }
      });

      setTotalHeights(getTotalHeight);

      footerRef.current.innerHTML = `Total Height: ${getTotalHeight}cm (${convertToFeetPerInches(getTotalHeight)}) - ${unknown} unknown height`;
    }
    return () => {
      setTotalHeights(0);
    };
  }, [currentPageData, totalHeights]);

  // table column definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "name", //access nested data with dot notation
        header: "Name",
        enableColumnFilter: false,
      },
      {
        accessorKey: "gender",
        header: "Gender",
      },
      {
        accessorKey: "height",
        header: "Height (CM)",
        enableColumnFilter: false,
        Footer: ({ column, footer, table }) => {
          setCurrentPageData(table.getPaginationRowModel().rows);
          return <span className="font-extrabold" ref={footerRef}></span>;
        },
      },
    ],
    []
  );

  return (
    <div className="relative App">
      {/* Full App page */}
      <main className="relative max-h-screen overflow-y-scroll snap snap-y snap-mandatory scrollbar-hide" ref={section2Ref}>
        {/* === === First page === === */}
        <section className="w-full h-screen snap-start">
          {/* Entry Intro */}
          <div className="fixed w-screen h-screen bg-black -z-10" id="body">
            <section className="w-full flex justify-center h-full align-middle z-[1] animate-intro text-blue-400 font-medium text-6xl opacity-0">
              <div className="flex flex-col justify-center">
                A long time ago, in a galaxy far,
                <br /> far away....
              </div>
            </section>
          </div>

          {/* Entry Logo */}
          <div className="flex justify-center w-full h-full">
            <StarWars className="self-center animate-enter logo" />
          </div>

          {/* Movie Select */}
          <div className="absolute bottom-0 flex justify-center w-full">
            <select
              name="movieSelect"
              className="duration-300 border-0 cursor-pointer animate-fadeInLag drop-shadow-md bg-amber-200 w-72 hover:bg-amber-300 focus:bg-amber-300 focus:outline-none"
              placeholder="Choose a Star Wars movie"
              onChange={(e) => setSelectedFilm(JSON.parse(e.target.value))}
            >
              {!error ? (
                films.map((film) => (
                  <option key={film.episode_id} value={JSON.stringify(film)} onClick={() => setSelectedFilm(film)} className="py-2 rounded-sm">
                    {film.title}
                  </option>
                ))
              ) : (
                <option disabled>
                  <i>...failed to load movies</i>
                </option>
              )}
            </select>
          </div>
        </section>

        {/* === === Second Page === === */}
        {selectedFilm && (
          <section className="relative w-full h-screen snap-start">
            {loading ? (
              <div className="h-full w-full flex justify-center">
                <div className="flex flex-col justify-center">
                  <Loader color="yellow" className="self-center my-auto" />
                </div>
              </div>
            ) : (
              <>
                {/* Opening crawl text */}
                <div id="board" className="w-screen">
                  <div id="content">
                    <p id="title" className="story">
                      Episode {fetchedMovieDeets?.episode_id}
                    </p>
                    <p id="subtitle" className="story">
                      {fetchedMovieDeets?.title}
                    </p>
                    <br />
                    <p className="story">{fetchedMovieDeets?.opening_crawl}</p>
                  </div>
                </div>

                {/* Table Modal */}
                <div className="container-fluid flex justify-center">
                  <div
                    className="main-modal fixed w-full h-100 inset-0 z-50 overflow-hidden hidden justify-center items-center animated fadeIn faster"
                    ref={modal}
                  >
                    <div className="border border-teal-500 modal-container bg-white w-11/12 md:max-w-7xl mx-auto rounded shadow-lg z-50 overflow-y-auto">
                      <div className="modal-content py-4 text-left px-6">
                        {/* <!--Title--> */}
                        <div className="flex justify-between items-center pb-3">
                          <p className="text-2xl font-bold">Star Wars - {fetchedMovieDeets?.title}: Characters</p>
                          <div className="modal-close cursor-pointer z-50" onClick={modalClose}>
                            <svg className="fill-current text-black" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                              <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                            </svg>
                          </div>
                        </div>
                        {/* <!--Body--> */}
                        <div className="my-5">
                          <MaterialReactTable
                            columns={columns}
                            data={fetchedCharacterDeets}
                            enableFullScreenToggle={false}
                            enableDensityToggle={false}
                            enableColumnActions={false}
                            initialState={{
                              showColumnFilters: true,
                              density: "compact"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table modal handler button */}
                  <button type="button" onClick={openModal} className="bg-amber-500 text-white p-1 rounded text-xl font-bold">
                    Show Movie Characters
                  </button>

                  {/* Muter */}
                  <div className="cursor-pointer absolute right-0" type="button" onClick={muteAudio}>
                    {!muted ? (
                      <img src={`https://img.icons8.com/small/32/ffffff/high-volume.png`} className="mr-0 h-6" alt="music Icon" />
                    ) : (
                      <img src={`https://img.icons8.com/small/32/ffffff/mute.png`} className="mr-0 h-6" alt="music Icon" />
                    )}
                  </div>

                  {/* The grand theme song */}
                  <audio
                    src="https://s.cdpn.io/1202/Star_Wars_original_opening_crawl_1977.mp3"
                    className="hidden"
                    type="audio/mpeg"
                    controls
                    muted={muted}
                    autoPlay={!false}
                  />
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
