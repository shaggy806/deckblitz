/**
 * Renown N (rule 702.112): "When this creature deals combat damage to a player, if it isn't
 * renowned, put N +1/+1 counters on it and it becomes renowned" — the `renown()` helper's
 * trigger, its `renown` effect, the `renowned` designation (a filter clause, cleared when the
 * permanent leaves) and the `becomes-renowned` trigger.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const renowned = (game: Game, id: ObjectId): boolean => game.state.objects[id].renowned === true;

describe("renown (rule 702.112)", () => {
  it("Topan Freeblade: combat damage to a player puts the counter on it and makes it renowned, once", () => {
    const { game, a } = table();
    const blade = spawn(game, "Topan Freeblade");
    attack(game, a, [blade]);
    expect(counters(game, blade)).toBe(1);
    expect(renowned(game, blade)).toBe(true);
    expect(life(game, B)).toBe(18);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [blade]);
    expect(counters(game, blade)).toBe(1);
    expect(life(game, B)).toBe(15);
  });

  it("blocked, it deals no damage to a player and doesn't become renowned", () => {
    const { game, a, b } = table();
    const blade = spawn(game, "Topan Freeblade");
    const wall = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: blade }];
    attack(game, a, [blade]);
    expect(counters(game, blade)).toBe(0);
    expect(renowned(game, blade)).toBe(false);
  });

  it("Goblin Glory Chaser has menace only once it's renowned", () => {
    const { game, a } = table();
    const goblin = spawn(game, "Goblin Glory Chaser");
    expect(keywords(game, goblin).has("menace")).toBe(false);
    attack(game, a, [goblin]);
    expect(keywords(game, goblin).has("menace")).toBe(true);
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
  });

  it("Valeron Wardens draws for each creature you control that becomes renowned", () => {
    const { game, a } = table();
    const wardens = spawn(game, "Valeron Wardens");
    const blade = spawn(game, "Topan Freeblade");
    const before = hand(game).length;
    attack(game, a, [wardens, blade]);
    expect(counters(game, wardens)).toBe(2);
    expect(counters(game, blade)).toBe(1);
    expect(hand(game).length).toBe(before + 2);
  });

  it("a creature that left before its renown trigger resolved never becomes renowned, and nothing triggers", () => {
    const { game, a } = table();
    spawn(game, "Valeron Wardens", A, { tapped: true });
    const blade = spawn(game, "Topan Freeblade");
    const before = hand(game).length;
    a.declareAttackersFn = () => [{ attacker: blade, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugMove(blade, "graveyard");
    settle(game);
    expect(zone(game, blade)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });

  it("renowned ends when the permanent leaves the battlefield: the card that returns isn't", () => {
    const { game, a } = table();
    const blade = spawn(game, "Topan Freeblade");
    attack(game, a, [blade]);
    expect(renowned(game, blade)).toBe(true);
    game.debugMove(blade, "hand");
    lands(game, "Plains", 2);
    toStep(game, "postcombat-main");
    cast(game, blade);
    expect(renowned(game, blade)).toBe(false);
    expect(counters(game, blade)).toBe(0);
  });

  it("Relic Seeker: becoming renowned lets you search for an Equipment card", () => {
    const { game, a } = table();
    const seeker = spawn(game, "Relic Seeker");
    const sword = toLibrary(game, "Bonesplitter");
    a.chooseModesFn = () => [0]; // "you may search": yes
    pickFromZone(a, sword);
    attack(game, a, [seeker]);
    expect(zone(game, sword)).toBe("hand");
  });

  it("Consul's Lieutenant pumps the other attackers only while it's renowned", () => {
    const { game, a } = table();
    const consul = spawn(game, "Consul's Lieutenant");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [consul, bears]);
    expect(life(game, B)).toBe(16); // 2 + 2: not renowned as it attacked
    expect(renowned(game, consul)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [consul, bears]);
    expect(life(game, B)).toBe(16 - 3 - 3); // 3 (its counter) + 3 (the pump)
  });

  it("Scab-Clan Berserker punishes a noncreature spell only once renowned", () => {
    const { game, a } = table();
    const berserker = spawn(game, "Scab-Clan Berserker");
    nextTurn(game);
    lands(game, "Island", 6, B);
    cast(game, toHand(game, "Divination", B), { player: B });
    expect(life(game, B)).toBe(20);
    nextTurn(game);
    attack(game, a, [berserker]);
    expect(life(game, B)).toBe(18);
    nextTurn(game);
    cast(game, toHand(game, "Divination", B), { player: B });
    expect(life(game, B)).toBe(16);
  });

  it("Enshrouding Mist untaps only a renowned creature", () => {
    const { game, a } = table();
    const blade = spawn(game, "Topan Freeblade");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    attack(game, a, [blade]);
    game.state.objects[blade].tapped = true;
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Enshrouding Mist"), { targets: [ref(blade)] });
    cast(game, toHand(game, "Enshrouding Mist"), { targets: [ref(bears)] });
    expect(game.state.objects[blade].tapped).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Honored Hierarch gains vigilance and a mana ability once renowned", () => {
    const { game, a } = table();
    const hierarch = spawn(game, "Honored Hierarch");
    expect(keywords(game, hierarch).has("vigilance")).toBe(false);
    attack(game, a, [hierarch]);
    expect(keywords(game, hierarch).has("vigilance")).toBe(true);
    // It attacked before it was renowned, so it tapped then.
    game.state.objects[hierarch].tapped = false;
    expect(game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === hierarch)).toBe(true);
  });

  it("Aragorn grants renown 1 to attackers, and doubles a renowned attacker's counters", () => {
    const { game, a } = table();
    spawn(game, "Aragorn, Hornburg Hero", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    // Not renowned as it dealt the damage: one counter, not doubled (the ruling).
    expect(counters(game, bears)).toBe(1);
    expect(renowned(game, bears)).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(2);
  });

  it("two instances of renown: the first to resolve makes it renowned, the other does nothing (702.112c)", () => {
    const { game, a } = table();
    spawn(game, "Aragorn, Hornburg Hero", A, { tapped: true });
    const castellan = spawn(game, "Citadel Castellan");
    attack(game, a, [castellan]);
    expect(renowned(game, castellan)).toBe(true);
    expect([1, 2]).toContain(counters(game, castellan));
  });

  it("Constable of the Realm: renown's counters exile a nonland permanent until it leaves", () => {
    const { game, a } = table();
    const constable = spawn(game, "Constable of the Realm");
    const ring = spawn(game, "Sol Ring", B);
    attack(game, a, [constable]);
    expect(counters(game, constable)).toBe(2);
    expect(zone(game, ring)).toBe("exile");
    game.debugMove(constable, "graveyard");
    settle(game);
    expect(named(game, "Sol Ring", B).map((id) => zone(game, id))).toContain("battlefield");
  });
});
