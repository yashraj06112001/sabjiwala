-- CreateTable
CREATE TABLE "post" (
    "postId" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL,
    "video" VARCHAR,
    "image" VARCHAR,

    CONSTRAINT "PK_9b3ab408235ba7d60345a84f994" PRIMARY KEY ("postId")
);

-- CreateTable
CREATE TABLE "user" (
    "phone_number" VARCHAR NOT NULL,
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vegetable" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR NOT NULL,
    "price" INTEGER,
    "availability" BOOLEAN,
    "available_places" BIGINT[],
    "good_for" BIGINT[],
    "bad_for" BIGINT[],
    "images" BIGINT[],

    CONSTRAINT "vegetable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");
