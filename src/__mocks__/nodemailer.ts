const sendMailMock = jest.fn();

export default {
  createTransport: jest.fn().mockReturnValue({
    sendMail: sendMailMock,
  }),
};

export { sendMailMock };
