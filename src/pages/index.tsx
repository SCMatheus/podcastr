// SPA
//  useEffect(() => {
//  fetch('http://localhost:3333/episodes')
//  .then(response => response.json())
//  .then(data => console.log(data))
//  }, [])
//  é carregado ao acessar a pagina então os crawlers não esperam a requisição
//
// SSR
//export async function getServerSideProps() {
//  const response = await fetch('http://localhost:3333/episodes')
//  const data = await response.json()
//
//  return{
//    props: {
//      episodes: data
//    }
//  }
//}
// a chamada à API ocorre toda vez que a pagina é carregada, no entanto já neste
// caso os dados são carregados no servidor do next antes da pagina ser carregada
//
// SSG
//export async function getStaticProps() {
//  const response = await fetch('http://localhost:3333/episodes')
//   const data = await response.json()

//   return{
//     props: {
//       episodes: data
//     },
//     revalidate: 60 * 60 * 8, // tempo em segundos que os dados serão buscados novamente pela API
//   }
// }
// A diferença entre o SSG e o SSR é somente o nome do metodo de buscar os dados
// Para o SSG é possível enviar um parâmetro de quanto em quanto tempo os dados serão atualizados


//IMPORTANTE//
// Para toda listagem o next precisa de uma key para identificar qual item foi retirado da lista,
// adicionado, modificado, etc. e assim poder alterar diretamente somente tal item
// fazendo com que não precise alterar todos os itens da tela de uma vez

import { GetStaticProps } from 'next';
import Image from 'next/image';
import api from '../services/api';
import Link from 'next/link';
import ptBR from 'date-fns/locale/pt-BR';
import {format, parseISO} from 'date-fns';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';
import Head from 'next/head'

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type HomeProps = {
  latestEpisodes: Array<Episode>;// ou Episode[]
  allEpisodes: Episode[];
}

export default function Home({latestEpisodes, allEpisodes} : HomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];


  return (
    <div className={styles.homepage}>

      <Head>
        <title>Home | Podcastr</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>
        
        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}> 
                <Image width={192} 
                       height={192} 
                       src={episode.thumbnail} 
                       alt={episode.title}
                       objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episode/${episode.id}`}>
                    <a >{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>
          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}>
                    <td style={{width: 72}}>
                      <Image 
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover" 
                      />
                    </td>
                    <td>
                    <Link href={`/episode/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{width: 100}}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => playList(episodeList, (index + latestEpisodes.length))}>
                        <img src="/play-green.svg" alt="Tocar episódio"/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </section>
    </div>
  )
}

export const getStaticProps : GetStaticProps = async () =>  {
  const { data } = await api.get('episodes',
  {
    params: {
      _limit: 12,
      _sort: 'published_at', 
      _order: 'desc'
    }
  });


  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  });

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return{
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8, // tempo em segundos que os dados serão buscados novamente pela API
  }
}