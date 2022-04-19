import { useState, useEffect, useMemo } from 'react';
import { getTopTracks, getAudioFeaturesForTracks } from '../spotify';
import { catchErrors } from '../utils';
import { SectionWrapper, TrackList, TimeRangeButtons, Loader, ProgressBar } from '../components';
import RadarChart from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index5.css';

const TopTracks = () => {
  const [topTracks, setTopTracks] = useState(null);
  const [activeRange, setActiveRange] = useState('short');
  const [audioFeatures, setAudioFeatures] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getTopTracks(`${activeRange}_term`);
      setTopTracks(data);
    };
    catchErrors(fetchData());

  }, [activeRange]);
  
  useEffect(() => {
    if (!topTracks) {
      return;
    }

    // Also update the audioFeatures state variable using the track IDs
    const fetchAudioFeatures = async () => {
      const ids = topTracks.items.map((track,i) => track.id).join(',');
      const { data } = await getAudioFeaturesForTracks(ids);
      setAudioFeatures(data['audio_features']
      );
    };
    catchErrors(fetchAudioFeatures());

  }, [topTracks]);

  const average = (array) => array.reduce((a, b) => a + b) / array.length;

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

    //console.log([danceAvg,acousticAvg,tempoAvg]);

    return [{data: {danceAvg,energyAvg,valenceAvg,acousticAvg,livelyAvg,speechAvg,instAvg}, meta: { color: 'green' }  }];

  },[audioFeatures]);


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


  return (
    <main>
      <SectionWrapper title="Top 20 Tracks" breadcrumb={true}>
        <TimeRangeButtons
          activeRange={activeRange}
          setActiveRange={setActiveRange}
        />

        {topTracks && topTracks.items ? (
          <TrackList tracks={topTracks.items.slice(0,10)} />
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
  );
};

export default TopTracks;