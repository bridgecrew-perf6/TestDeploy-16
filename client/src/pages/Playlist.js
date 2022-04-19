import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getPlaylistById, getAudioFeaturesForTracks } from '../spotify';
import { catchErrors } from '../utils';
import { TrackList, SectionWrapper, Loader, ProgressBar } from '../components';
import { StyledHeader, StyledDropdown } from '../styles';
import RadarChart from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index5.css';

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [tracksData, setTracksData] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [sortValue, setSortValue] = useState('');
  const sortOptions = ['danceability', 'tempo', 'energy'];

  // Get playlist data based on ID from route params
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getPlaylistById(id);
      setPlaylist(data);
      setTracksData(data.tracks);
    };

    catchErrors(fetchData());
  }, [id]);

  // When tracksData updates, compile arrays of tracks and audioFeatures
  useEffect(() => {
    if (!tracksData) {
      return;
    }

    // When tracksData updates, check if there are more tracks to fetch
    // then update the state variable
    const fetchMoreData = async () => {
      if (tracksData.next) {
        const { data } = await axios.get(tracksData.next);
        setTracksData(data);
      }
    };
    setTracks(tracks => ([
      ...tracks ? tracks : [],
      ...tracksData.items
    ]));
    catchErrors(fetchMoreData());

    // Also update the audioFeatures state variable using the track IDs
    const fetchAudioFeatures = async () => {
      const ids = tracksData.items.map(({ track }) => track.id).join(',');
      const { data } = await getAudioFeaturesForTracks(ids);
      setAudioFeatures(audioFeatures => ([
        ...audioFeatures ? audioFeatures : [],
        ...data['audio_features']
      ]));
    };
    catchErrors(fetchAudioFeatures());

  }, [tracksData]);

  const average = (array) => array.reduce((a, b) => a + b) / array.length;

  const captions = {
    // columns
    danceAvg: 'Danceability',
    energyAvg: 'Energy',
    valenceAvg: 'Valence',
    acousticAvg: 'Acousticness',
    livelyAvg: 'Liveliness',
    speechAvg: 'Speechiness',
    instAvg: 'Instrumentalness'
  };

  const dataSet = useMemo(() => {
    if(!audioFeatures){
      return;
    }

    const danceAvg = average(audioFeatures.map(x => x.danceability));
    const energyAvg = average(audioFeatures.map(x => x.energy));
    const valenceAvg = average(audioFeatures.map(x => x.valence));
    const acousticAvg = average(audioFeatures.map(x => x.acousticness));
    const livelyAvg = average(audioFeatures.map(x => x.liveness));
    const speechAvg = average(audioFeatures.map(x => x.speechiness));
    const instAvg = average(audioFeatures.map(x => x.instrumentalness));
    const tempoAvg = average(audioFeatures.map(x => x.tempo));
    const loudAvg = average(audioFeatures.map(x => x.loudness));
    const timeAvg = average(audioFeatures.map(x => x.time_signature));

    return [{data: {danceAvg,energyAvg,valenceAvg,acousticAvg,livelyAvg,speechAvg,instAvg}, meta: { color: 'blue' }  }];

  },[audioFeatures]);


  console.log(dataSet);

  // Map over tracks and add audio_features property to each track
  const tracksWithAudioFeatures = useMemo(() => {
    if (!tracks || !audioFeatures) {
      return null;
    }

    return tracks.map(({ track }) => {
      const trackToAdd = track;

      if (!track.audio_features) {
        const audioFeaturesObj = audioFeatures.find(item => {
          if (!item || !track) {
            return null;
          }
          return item.id === track.id;
        });

        trackToAdd['audio_features'] = audioFeaturesObj;
      }

      return trackToAdd;
    });
  }, [tracks, audioFeatures]);

  //console.log(tempoAvg)

  // Sort tracks by audio feature to be used in template
  const sortedTracks = useMemo(() => {
    if (!tracksWithAudioFeatures) {
      return null;
    }

    return [...tracksWithAudioFeatures].sort((a, b) => {
      const aFeatures = a['audio_features'];
      const bFeatures = b['audio_features'];

      if (!aFeatures || !bFeatures) {
        return false;
      }

      return bFeatures[sortValue] - aFeatures[sortValue];
    });
  }, [sortValue, tracksWithAudioFeatures]);

  return (
    <>
      {playlist && (
        <>
          <StyledHeader>
            <div className="header__inner">
              {playlist.images.length && playlist.images[0].url && (
                <img className="header__img" src={playlist.images[0].url} alt="Playlist Artwork"/>
              )}
              <div>
                <div className="header__overline">Playlist</div>
                <h1 className="header__name">{playlist.name}</h1>
                <p className="header__meta">
                  {playlist.followers.total ? (
                    <span>{playlist.followers.total} {`follower${playlist.followers.total !== 1 ? 's' : ''}`}</span>
                  ) : null}
                  <span>{playlist.tracks.total} {`song${playlist.tracks.total !== 1 ? 's' : ''}`}</span>
                </p>
              </div>
            </div>
          </StyledHeader>

          <main>
            <SectionWrapper title="Playlist" breadcrumb={true}>
              <StyledDropdown active={!!sortValue}>
                <label className="sr-only" htmlFor="order-select">Sort tracks</label>
                <select
                  name="track-order"
                  id="order-select"
                  onChange={e => setSortValue(e.target.value)}
                  >
                  <option value="">Sort tracks</option>
                  {sortOptions.map((option, i) => (
                    <option value={option} key={i}>
                      {`${option.charAt(0).toUpperCase()}${option.slice(1)}`}
                    </option>
                  ))}
                </select>
              </StyledDropdown>

              {sortedTracks ? (
                <TrackList tracks={sortedTracks} />
              ) : (
                <Loader />
              )}

          {dataSet ? (
          <main>
            <div class="float-container" style={{display: 'flex', backgroundColor: '#404040', borderRadius: 25, boxShadow: "10px 20px 30px #A0A0A0"}}>
              <div id='bar' style={{flex: '1'}}>
                <h2 style={{paddingLeft: 45, paddingTop:10}}>Average attribute scores: </h2>
                <ProgressBar label="Danceability" bgcolor="green" completed={(dataSet[0].data.danceAvg*100).toFixed(0)} />
                <ProgressBar label="Energy" bgcolor="green" completed={(dataSet[0].data.energyAvg*100).toFixed(0)} />
                <ProgressBar label="Valence" bgcolor="green" completed={(dataSet[0].data.valenceAvg*100).toFixed(0)} />
                <ProgressBar label="Accousticness" bgcolor="green" completed={(dataSet[0].data.acousticAvg*100).toFixed(0)} />
                <ProgressBar label="Liveliness" bgcolor="green" completed={(dataSet[0].data.livelyAvg*100).toFixed(0)} />
                <ProgressBar label="Speechiness" bgcolor="green" completed={(dataSet[0].data.speechAvg*100).toFixed(0)} />
                <ProgressBar label="Instrumentalness" bgcolor="green" completed={(dataSet[0].data.instAvg*100).toFixed(0)} />
              </div>

              <div id='radar' style={{flex: 1}}>
              <RadarChart captions={captions} data={dataSet} size={450} />
              </div>
            </div>
            <div style={{backgroundColor: 'transparent', borderRadius: 25}}>
            </div>
          </main>
        ) : (
          <Loader />
        )}
            </SectionWrapper>
          </main>
        </>
      )}
    </>
  );
};

export default Playlist;
