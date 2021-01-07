import {
  authenticate,
  AuthenticateFn,
  AuthenticationBindings,
  AuthenticationComponent,
  AuthenticationStrategy,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  registerAuthenticationStrategy,
  TokenService,
  UserService,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import { BootMixin } from '@loopback/boot';
import {
  bind,
  BindingKey,
  globalInterceptor,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import { ApplicationConfig, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import {
  belongsTo,
  Count,
  CountSchema,
  Entity,
  Filter,
  FilterExcludingWhere,
  juggler,
  model,
  property,
  repository,
  RepositoryMixin,
  Where,
} from '@loopback/repository';
import {
  api,
  DefaultSequence,
  del,
  FindRoute,
  get,
  getModelSchemaRef,
  HttpErrors,
  InvokeMethod,
  InvokeMiddleware,
  param,
  ParseParams,
  patch,
  post,
  put,
  Reject,
  Request,
  requestBody,
  RequestContext,
  ResponseObject,
  RestApplication,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { UserProfile } from '@loopback/security';
import { ServiceMixin } from '@loopback/service-proxy';
import amqp from 'amqplib';
import async from 'async';
import bcrypt from 'bcrypt';
import { pbkdf2 } from 'crypto';
import CryptoJs from 'crypto-js';
import md5 from 'crypto-js/md5';
import sha1 from 'crypto-js/sha1';
import sha256 from 'crypto-js/sha256';
import fs from 'fs';
import moment from 'moment';
import nodemailer from 'nodemailer';
import path from 'path';
import rp from 'request-promise';
import util from 'util';
import xml2Json from 'xml2json';
const cryptoNative = require('crypto');

export {
  async,
  bind,
  AuthenticateFn,
  AuthenticationBindings,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  USER_PROFILE_NOT_FOUND,
  AuthenticationComponent,
  registerAuthenticationStrategy,
  ApplicationConfig,
  lifeCycleObserver,
  LifeCycleObserver,
  authenticate,
  AuthenticationStrategy,
  belongsTo,
  Entity,
  model,
  property,
  BootMixin,
  bcrypt,
  BindingKey,
  Count,
  CountSchema,
  DefaultSequence,
  Filter,
  juggler,
  FilterExcludingWhere,
  FindRoute,
  RepositoryMixin,
  globalInterceptor,
  Interceptor,
  InvocationContext,
  InvocationResult,
  InvokeMiddleware,
  Provider,
  ValueOrPromise,
  InvokeMethod,
  UserService,
  TokenService,
  repository,
  Where,
  amqp,
  RestExplorerBindings,
  RestExplorerComponent,
  md5,
  ParseParams,
  RestApplication,
  sha256,
  sha1,
  fs,
  path,
  CryptoJs,
  Reject,
  rp,
  moment,
  HttpErrors,
  ResponseObject,
  nodemailer,
  xml2Json,
  inject,
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  api,
  Request,
  RequestContext,
  RestBindings,
  SequenceHandler,
  ServiceMixin,
  Send,
  util,
  UserProfile,
  cryptoNative,
  pbkdf2,
};
