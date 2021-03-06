import fetchJsonpLib from 'fetch-jsonp';

export const sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

/**
 * JSONの取得
 * @param url 取得先のURL
 * @return JSONオブジェクト
 * @throws 通信エラー
 * @throws JSON変換エラー
 */
export const fetchJson = async (url: string) => {
  try {
    const result = await fetch(url);
    const config = await result.json();
    return config;
  } catch (e) {
    throw new Error('通信エラーが発生しました。');
  }
};

/**
 * JSONPの取得
 * @param url URL
 */
export function fetchJsonp(url: string): Promise<{ data: { htmlStr: string; status: string; url: string } }> {
  const newUrl = `https://script.google.com/macros/s/AKfycbyGqtJYxOIgvFgYW-xZRW4ZGQAfwPunJGzm6WwiCetbI56CGJWh/exec?url=${encodeURIComponent(url)}`;
  return new Promise((resolve, reject) => {
    fetchJsonpLib(newUrl, {
      jsonpCallback: 'callback',
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        resolve({ data: json });
      })
      .catch((error) => {
        reject({ error });
      });
  });
}

export const postJson = async (url: string, body: object) => {
  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await result.json();
  } catch (error) {
    throw new Error('通信エラーが発生しました。');
  }
};

export const postFile = async (url: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append(file.name, file);

    const result = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return await result.json();
  } catch (error) {
    throw new Error('通信エラーが発生しました。');
  }
};
