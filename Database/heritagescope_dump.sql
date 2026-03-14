--
-- PostgreSQL database dump
--

-- Dumped from database version 16.13 (Homebrew)
-- Dumped by pg_dump version 16.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: site_status; Type: TABLE; Schema: public; Owner: karliewan
--

CREATE TABLE public.site_status (
    id bigint NOT NULL,
    site_name character varying(255),
    latitude double precision,
    longitude double precision,
    visitor_pressure character varying(255),
    weather_condition character varying(255),
    risk_level character varying(255)
);


ALTER TABLE public.site_status OWNER TO karliewan;

--
-- Name: site_status_id_seq; Type: SEQUENCE; Schema: public; Owner: karliewan
--

CREATE SEQUENCE public.site_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_status_id_seq OWNER TO karliewan;

--
-- Name: site_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: karliewan
--

ALTER SEQUENCE public.site_status_id_seq OWNED BY public.site_status.id;


--
-- Name: site_status id; Type: DEFAULT; Schema: public; Owner: karliewan
--

ALTER TABLE ONLY public.site_status ALTER COLUMN id SET DEFAULT nextval('public.site_status_id_seq'::regclass);


--
-- Data for Name: site_status; Type: TABLE DATA; Schema: public; Owner: karliewan
--

COPY public.site_status (id, site_name, latitude, longitude, visitor_pressure, weather_condition, risk_level) FROM stdin;
1	Jewellery Quarter	52.4875	-1.9109	HIGH	POOR	RED
2	Birmingham Museum	52.4796	-1.9026	MEDIUM	POOR	AMBER
3	Cadbury World	52.4508	-1.9302	LOW	GOOD	GREEN
4	Birmingham Cathedral	52.48	-1.8986	HIGH	GOOD	AMBER
5	Aston Hall	52.5047	-1.8879	LOW	POOR	AMBER
6	Library of Birmingham	52.4791	-1.9107	HIGH	POOR	RED
\.


--
-- Name: site_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: karliewan
--

SELECT pg_catalog.setval('public.site_status_id_seq', 6, true);


--
-- Name: site_status site_status_pkey; Type: CONSTRAINT; Schema: public; Owner: karliewan
--

ALTER TABLE ONLY public.site_status
    ADD CONSTRAINT site_status_pkey PRIMARY KEY (id);

--
-- Name: area_polygon; Type: TABLE; Schema: public; Owner: karliewan
--

CREATE TABLE public.area_polygon (
    id bigint NOT NULL,
    marker_latitude double precision NOT NULL,
    marker_longitude double precision NOT NULL,
    poly_data text NOT NULL
);


--
-- Data for Name: area_polygon; Type: TABLE DATA; Schema: public; Owner: karliewan
--

COPY public.area_polygon (id, marker_latitude, marker_longitude, poly_data) FROM stdin;
1	51.575	-0.252	[[51.59,-0.31],[51.62,-0.25],[51.585,-0.18],[51.535,-0.22],[51.545,-0.3]]
2	51.515	-0.456	[[51.53,-0.52],[51.565,-0.445],[51.525,-0.38],[51.47,-0.43],[51.485,-0.505]]
3	51.489	-0.099	[[51.505,-0.16],[51.54,-0.095],[51.5,-0.025],[51.445,-0.07],[51.455,-0.145]]
4	51.437	-0.304	[[51.455,-0.365],[51.49,-0.3],[51.445,-0.235],[51.395,-0.275],[51.405,-0.345]]
5	51.659	-0.055	[[51.675,-0.12],[51.71,-0.05],[51.67,0.02],[51.615,-0.025],[51.625,-0.1]]
6	51.375	-0.145	[[51.39,-0.205],[51.425,-0.145],[51.385,-0.075],[51.33,-0.115],[51.345,-0.185]]
7	52.505	-1.955	[[52.52,-2.03],[52.555,-1.955],[52.515,-1.885],[52.46,-1.93],[52.475,-2.005]]
8	52.43	-1.905	[[52.445,-1.975],[52.48,-1.905],[52.44,-1.835],[52.385,-1.875],[52.395,-1.95]]
9	52.58	-1.717	[[52.6,-1.785],[52.635,-1.715],[52.595,-1.64],[52.54,-1.685],[52.555,-1.76]]
10	52.345	-1.543	[[52.365,-1.61],[52.4,-1.54],[52.36,-1.47],[52.305,-1.51],[52.32,-1.585]]
11	53.495	-2.308	[[53.515,-2.38],[53.55,-2.305],[53.51,-2.23],[53.455,-2.275],[53.47,-2.35]]
12	53.445	-1.948	[[53.465,-2.02],[53.5,-1.95],[53.46,-1.875],[53.405,-1.92],[53.42,-1.995]]
13	53.34	-2.639	[[53.36,-2.71],[53.395,-2.64],[53.355,-2.56],[53.3,-2.605],[53.315,-2.68]]
14	53.265	-2.942	[[53.285,-3.01],[53.32,-2.94],[53.28,-2.865],[53.225,-2.91],[53.24,-2.985]]
15	53.74	-1.652	[[53.76,-1.72],[53.795,-1.65],[53.755,-1.575],[53.7,-1.62],[53.715,-1.695]]
16	53.91	-1.542	[[53.93,-1.61],[53.965,-1.54],[53.925,-1.465],[53.87,-1.51],[53.885,-1.585]]
17	53.195	-1.562	[[53.22,-1.63],[53.255,-1.56],[53.215,-1.485],[53.16,-1.53],[53.175,-1.605]]
18	53.995	-2.797	[[54.02,-2.87],[54.055,-2.8],[54.015,-2.725],[53.96,-2.77],[53.975,-2.845]]
19	54.61	-1.752	[[54.63,-1.82],[54.665,-1.75],[54.625,-1.675],[54.57,-1.72],[54.585,-1.795]]
20	54.96	-1.702	[[54.98,-1.77],[55.015,-1.7],[54.975,-1.625],[54.92,-1.67],[54.935,-1.745]]
21	55.915	-3.277	[[55.94,-3.35],[55.975,-3.275],[55.935,-3.195],[55.88,-3.24],[55.895,-3.315]]
22	55.865	-4.357	[[55.89,-4.43],[55.925,-4.355],[55.885,-4.275],[55.83,-4.32],[55.845,-4.395]]
23	55.955	-3.982	[[55.98,-4.05],[56.015,-3.98],[55.975,-3.905],[55.92,-3.95],[55.935,-4.025]]
24	56.185	-3.357	[[56.21,-3.43],[56.245,-3.355],[56.205,-3.28],[56.15,-3.325],[56.165,-3.4]]
25	57.155	-2.192	[[57.18,-2.26],[57.215,-2.19],[57.175,-2.115],[57.12,-2.16],[57.135,-2.235]]
26	57.555	-4.277	[[57.58,-4.35],[57.615,-4.275],[57.575,-4.2],[57.52,-4.245],[57.535,-4.32]]
27	51.64	-3.112	[[51.66,-3.18],[51.695,-3.11],[51.655,-3.035],[51.6,-3.08],[51.615,-3.155]]
28	51.52	-3.462	[[51.545,-3.53],[51.58,-3.46],[51.54,-3.385],[51.485,-3.43],[51.5,-3.505]]
29	50.74	-1.492	[[50.76,-1.56],[50.795,-1.49],[50.755,-1.415],[50.7,-1.46],[50.715,-1.535]]
30	50.915	-1.082	[[50.94,-1.15],[50.975,-1.08],[50.935,-1.005],[50.88,-1.05],[50.895,-1.125]]
\.


--
-- Name: area_polygon area_polygon_pkey; Type: CONSTRAINT; Schema: public; Owner: karliewan
--

ALTER TABLE ONLY public.area_polygon
    ADD CONSTRAINT area_polygon_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--
