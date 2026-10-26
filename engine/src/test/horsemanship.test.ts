// Horsemanship (rule 702.31), Portal Three Kingdoms' evasion keyword: a
// creature with it can't be blocked by creatures without it (702.31b), and it
// blocks anything. Flying and reach don't count (the cards' rulings).
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  destroy,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";
import type { BlockOffer } from "./harness.js";
import type { ObjectId } from "../primitives.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] | undefined =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock;

describe("horsemanship", () => {
  it("is blocked only by creatures with horsemanship, flying and reach aside", () => {
    const { game, a } = table();
    const cavalry = spawn(game, "Shu Cavalry");
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const scout = spawn(game, "Wei Scout", B);
    const offer = blockOffer(game, a, [cavalry, bears]);
    expect(canBlock(offer, angel)).toEqual([bears]);
    expect([...(canBlock(offer, scout) ?? [])].sort()).toEqual([cavalry, bears].sort());
  });

  it("Sun Quan gives every creature you control horsemanship", () => {
    const { game } = table();
    spawn(game, "Sun Quan, Lord of Wu");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("horsemanship")).toBe(true);
    expect(keywords(game, spawn(game, "Grizzly Bears", B)).has("horsemanship")).toBe(false);
  });
});

describe("Portal Three Kingdoms' horsemanship cards", () => {
  it("Broken Dam can't target a creature with horsemanship", () => {
    const { game } = table();
    const cavalry = spawn(game, "Shu Cavalry", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    const dam = toHand(game, "Broken Dam");
    expect(() => cast(game, dam, { targets: [ref(cavalry), null] })).toThrow();
    cast(game, dam, { targets: [ref(bears), null] });
    expect(game.state.objects[bears]!.tapped).toBe(true);
  });

  it("Riding the Dilu Horse lasts past the turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Riding the Dilu Horse"), { targets: [ref(bears)] });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("horsemanship")).toBe(true);
  });

  it("Liu Bei gets +2/+2 with Guan Yu or Zhang Fei", () => {
    const { game } = table();
    const liu = spawn(game, "Liu Bei, Lord of Shu");
    expect(pt(game, liu)).toEqual({ power: 2, toughness: 4 });
    const zhang = spawn(game, "Zhang Fei, Fierce Warrior");
    expect(pt(game, liu)).toEqual({ power: 4, toughness: 6 });
    destroy(game, zhang);
    expect(pt(game, liu)).toEqual({ power: 2, toughness: 4 });
  });

  it("Guan Yu may shuffle itself into your library when it dies", () => {
    const { game, a } = table();
    const guan = spawn(game, "Guan Yu, Sainted Warrior");
    pickModes(a, 0);
    destroy(game, guan);
    const names = (z: "graveyard" | "library") => game.state.zones.perPlayer[A][z].map((id) => game.state.objects[id]!.cardName);
    expect(names("graveyard")).not.toContain("Guan Yu, Sainted Warrior");
    expect(names("library")).toContain("Guan Yu, Sainted Warrior");
  });

  it("Xiahou Dun returns a black card, only before attackers on your turn", () => {
    const { game } = table();
    const dun = spawn(game, "Xiahou Dun, the One-Eyed");
    const black = toGraveyard(game, "Wei Scout");
    const before = hand(game).length;
    activate(game, dun, 0, { targets: [ref(black)] });
    expect(zone(game, black)).toBe("hand");
    expect(zone(game, dun)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });
});
