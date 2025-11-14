/*This os the server file that will load quiz data
from json files in the data directory and serve it via an API.
*/

import express from 'express' // Express framework for building the server
import fs from 'fs'// File system module to read files  
import npmlog from 'npmlog'// logging module for better logging


