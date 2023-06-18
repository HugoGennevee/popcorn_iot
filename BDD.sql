CREATE TABLE `user` (
  `id` varchar(255) UNIQUE PRIMARY KEY,
  `email` varchar(255) UNIQUE,
  `password` varchar(255),
  `prenom` varchar(255),
  `nom` varchar(255)
);

CREATE TABLE `abonnement` (
  `id` varchar(255) UNIQUE PRIMARY KEY,
  `user` varchar(255),
  `nb_utilisations_restantes` integer,
  `updated_at` datetime,
  `created_at` datetime
);

ALTER TABLE `abonnement` ADD FOREIGN KEY (`user`) REFERENCES `user` (`id`);