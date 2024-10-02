export default () => {
  process.on('unhandledRejection', (reason) => {
    console.log('found problems from global setup!');
    console.log(String(reason));
    process.exit(1);
  });
};
