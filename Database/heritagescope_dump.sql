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
-- PostgreSQL database dump complete
--
