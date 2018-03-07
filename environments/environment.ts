// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
 production: true,
  firebaseConfig:{
     apiKey: "AIzaSyCxRfU-E25a-KNf_tR1wR8cq12Svt9jtBo",
    authDomain: "roster-manager-login.firebaseapp.com",
    databaseURL: "https://roster-manager-login.firebaseio.com",
    projectId: "roster-manager-login",
    storageBucket: "roster-manager-login.appspot.com",
    messagingSenderId: "792864118713"
  }
};
