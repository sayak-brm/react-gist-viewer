import React, { useState, useEffect } from "react";
import axios from "axios";

export default () => {
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState();
  const [results, setResults] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);

  const getResults = async (searchTerm) => {
    if (searchTerm) {
      let url = `https://api.github.com/users/${searchTerm}/gists`;
      try {
        let result = await Promise.all(
          (await axios.get(url)).data.map(async (r) => ({
            ...r,
            forks: (await axios.get(r.forks_url)).data
          }))
        );
        setResults(result);
      } catch (e) {
        setError("Unable to fetch results from GitHub.");
        setResults([]);
      }
      setLoading(false);
    }
  };

  const getFileTypes = async () => {
    let url =
      "https://gist.githubusercontent.com/ppisarczyk/43962d06686722d26d176fad46879d41/raw/211547723b4621a622fc56978d74aa416cbd1729/Programming_Languages_Extensions.json";
    try {
      setFileTypes((await axios.get(url)).data);
      setLoading(false);
    } catch (error) {
      setError("Unable to initialize.");
    }
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    setResults([]);
    if (loadingTimeout) clearTimeout(loadingTimeout);
    setLoadingTimeout(setTimeout(() => getResults(keyword), 1500));
  }, [keyword]);

  useEffect(() => {
    setLoading(true);
    getFileTypes();
  }, []);

  return (
    <div className="py-10 px-8">
      <h1 className="font-mono text-6xl font-bold text-center mb-12">
        Get GH Gists.
      </h1>

      {fileTypes.length > 0 ? (
        <div className="relative flex w-full flex-wrap items-stretch mb-3">
          <input
            type="text"
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="GitHub Username"
            className="px-3 py-3 placeholder-slate-300 text-slate-600 relative bg-white bg-white rounded-full text-sm border border-slate-300 outline-none focus:outline-none focus:ring w-full pr-10"
          />
          <span className="z-10 h-full leading-snug font-normal absolute text-center text-slate-300 absolute bg-transparent rounded text-base items-center justify-center w-8 right-0 pr-3 py-3">
            <i className="fas fa-user"></i>
          </span>
        </div>
      ) : (
        <></>
      )}

      {loading ? (
        <div className="w-full h-32 mb-4 rounded-lg flex flex-col border border-slate-300 items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full borderpostcss-import bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin">
            <div className="h-10 w-10 rounded-full bg-white"></div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {[undefined, null, ""].includes(error) ? (
        <></>
      ) : (
        <div className="w-full h-32 mb-4 rounded-lg flex flex-col border border-slate-300 items-center justify-center">
          <div className="m-auto">{error}</div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="rounded-lg flex flex-col border border-slate-300">
          {results.map((r, i) => {
            if ([null, ""].includes(r.description)) return <></>;

            let files = Object.keys(r.files)
              .map(
                (n) =>
                  fileTypes.find(
                    (ft) =>
                      ft?.extensions &&
                      ft.extensions.includes("." + n.split(".").at(-1))
                  )?.name
              )
              .filter((f) => f);
            files = [...new Set(files)];

            return (
              <div
                key={i}
                className={`w-full h-32 md:h-16 grid md:grid-cols-5 ${
                  i > 0 ? "border-t border-slate-300" : ""
                }`}
              >
                <div className="md:col-span-3 font-bold text-gray-600 px-4 flex">
                  <div className="w-full my-auto text-left md:whitespace-nowrap">
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Github"
                    >
                      {r.description.slice(0, 50) +
                        (r.description.length > 50 ? "..." : "")}
                    </a>
                  </div>
                </div>

                <div className="md:col-span-1 text-gray-500 px-4 flex">
                  <div className="w-full my-auto flex">
                    {r.forks.slice(0, 3).map((f, i) => (
                      <a
                        key={i}
                        href={f.html_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Github"
                      >
                        <div
                          style={{
                            backgroundSize: "contain",
                            backgroundImage: `url("${f.owner.avatar_url}")`
                          }}
                          className="rounded-full w-10 h-10 -mx-1 border border-solid border-white border-2"
                        />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-1 text-gray-500 px-4 flex">
                  <div className="w-full my-auto text-center whitespace-nowrap">
                    {files.join(", ").slice(0, 25)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
