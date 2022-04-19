import { useState } from 'react';
import { SectionWrapper, TrackSearchResult, TrackList, Loader } from '../components';
import {
    DashBoardContainer,
    SearchInput,
    ResultsContainer,
  } from "../styles/StyledGenerator.js"
import { getSearchOptions, getRecommendations } from '../spotify';
import { catchErrors } from '../utils';
import { Input } from '../styles/StyledSlider.js';
import styled from 'styled-components';

const Button = styled.button`
  background: white;
  display: inline-block;
  color: green;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 3.4px solid green;
  border-radius: 3px;
  display: block;

  height: 40px;
  width: 200px;
`;

const Generator = () => {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [seedList, setSeedList] = useState([]);
    const [seedID, setSeedID] = useState(null);
    const [playlist, setPlaylist] = useState(null);

    const [engValue, setEngValue] = useState(50);
    const [danValue, setDanValue] = useState(50);
    const [valValue, setValValue] = useState(50);
    const [accValue, setAccValue] = useState(50);
    const [livValue, setLivValue] = useState(50);
    const [speValue, setSpeValue] = useState(50);
    const [insValue, setInsValue] = useState(50);

    function chooseTrack(track) {
        setSeedList([track])
        setSeedID(track.id)
        setSearch("")
        setSearchResults([])
    }

    const handleChange = (event) => {
        setSearch(event.target.value);
        submitSearchData(search);
    };

    const submitSearchData = (value) => {
        const fetchSearchData = async () => {
            const { data } = await getSearchOptions(`${value.split(' ').join('%20')}`);
            setSearchResults(
                data.tracks.items.map(track => {
                  const smallestAlbumImage = track.album.images.reduce(
                    (smallest, image) => {
                      if (image.height < smallest.height) return image
                      return smallest
                    },
                    track.album.images[0]
                  )
        
                  return {
                    artist: track.artists[0].name,
                    title: track.name,
                    uri: track.uri,
                    albumUrl: smallestAlbumImage.url,
                    id: track.id,
                  }
                })
            );
        };
        catchErrors(fetchSearchData());
    };

    const submitRecommendationData = () => {

      const fetchRecommendationData = async () => {
        const { data } = await getRecommendations(seedID,(accValue/100),(danValue/100),(engValue/100),
        (insValue/100),(livValue/100),(speValue/100),(valValue/100));
        setPlaylist(data);
      };
      catchErrors(fetchRecommendationData());
    };

    console.log(playlist)


   return (
    <main>
        <SectionWrapper title="Playlist Generator" breadcrumb={true}>
        <DashBoardContainer>
      <SearchInput
        type="search"
        placeholder="Search Songs/Artists"
        value={search}
        onChange={handleChange}
      />
      <ResultsContainer>
        {searchResults.map(track => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
      </ResultsContainer>
      <ResultsContainer>
        {seedList.map(track => (
          <TrackSearchResult
            track={track}
            key={track.uri}
          />
        ))}
      </ResultsContainer>
      <div style={{backgroundColor: 'transparent', borderRadius: 25}}>
              <div name="grid-container">
                <div style={{display: 'grid', justifyItems: 'center'}}>
                  <p style={{gridColumn: 1}}>Energy</p>
                  <p style={{gridColumn: 2}}>Danceability</p>
                  <Input name="slider" onInput={e => setEngValue(e.target.value)} type="range" style={{gridColumn: 1, width: "75%", "--min": 0, "--max": 100, "--val": engValue}}/>
                  <Input name="slider" onInput={e => setDanValue(e.target.value)} type="range" style={{gridColumn: 2, width: "75%", "--min": 0, "--max": 100, "--val": danValue}}/>
                  <p style={{gridColumn: 1}}>Valence</p>
                  <p style={{gridColumn: 2}}>Accousticness</p>
                  <Input name="slider" onInput={e => setValValue(e.target.value)} type="range" style={{gridColumn: 1, width: "75%", "--min": 0, "--max": 100, "--val": valValue}}/>
                  <Input name="slider" onInput={e => setAccValue(e.target.value)} type="range" style={{gridColumn: 2, width: "75%", "--min": 0, "--max": 100, "--val": accValue}}/>
                  <p style={{gridColumn: 1}}>Liveliness</p>
                  <p style={{gridColumn: 2}}>Speechiness</p>
                  <Input name="slider" onInput={e => setLivValue(e.target.value)} type="range" style={{gridColumn: 1, width: "75%", "--min": 0, "--max": 100, "--val": livValue}}/>
                  <Input name="slider" onInput={e => setSpeValue(e.target.value)} type="range" style={{gridColumn: 2, width: "75%", "--min": 0, "--max": 100, "--val": speValue}}/>
                  <p style={{gridColumn: 1}}>Instrumentalness</p>
                  <Input name="slider" onInput={e => setInsValue(e.target.value)} type="range" style={{gridColumn: 1, width: "75%", "--min": 0, "--max": 100, "--val": insValue}}/>

                  <Button style={{gridColumn: 2}} onClick={submitRecommendationData}> Generate </Button>
                </div>
              </div>
            </div>
      </DashBoardContainer>
      {playlist ? (
        <TrackList tracks={playlist.tracks} />
        ) : (
          <Loader />
      )}
      </SectionWrapper>
    </main>
   );
}

export default Generator; 