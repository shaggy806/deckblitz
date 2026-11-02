/**
 * A cost exiling a count of graveyard cards beyond a fixed one: X announced
 * with the spell (Harvest Pyre, Chill Haunting, with `{X}` too Skeletal
 * Scrying — rule 107.3a), "the exiled card" read by the spell (Corpse
 * Explosion, Draconic Intervention) and by its copy (rule 707.10), optional
 * and linked to the permanent (Redemptor Dreadnought — rule 607.2a), and a
 * count read as it's activated (Araumi of the Dead Tide).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const offer = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }> | undefined =>
  game
    .legalActions(A)
    .find((x): x is Extract<LegalAction, { kind: "cast-spell" }> => x.kind === "cast-spell" && x.card === card);

describe("exile X cards from your graveyard as a spell's additional cost", () => {
  it("offers X up to the cards there, exiles that many, and deals X (Harvest Pyre)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const pyre = toHand(game, "Harvest Pyre");
    const bears = spawn(game, "Grizzly Bears", B);
    const one = toGraveyard(game, "Island");
    const two = toGraveyard(game, "Island");
    const three = toGraveyard(game, "Island");
    expect(offer(game, pyre)?.xCost?.maxX).toBe(3);
    const seen = pickFromZone(a, one, three);
    cast(game, pyre, { x: 2, targets: [ref(bears)] });
    expect([...seen.offered].sort()).toEqual([one, two, three].sort());
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, three)).toBe("exile");
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("exiles them all without asking when X is every card there", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const pyre = toHand(game, "Harvest Pyre");
    const wurm = spawn(game, "Craw Wurm", B);
    const one = toGraveyard(game, "Island");
    const two = toGraveyard(game, "Island");
    cast(game, pyre, { x: 2, targets: [ref(wurm)] });
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("X 0 exiles nothing and deals nothing, with an empty graveyard too", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const pyre = toHand(game, "Harvest Pyre");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(offer(game, pyre)?.xCost?.maxX).toBe(0);
    cast(game, pyre, { x: 0, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("refuses an X past the cards there (rule 118.3)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const pyre = toHand(game, "Harvest Pyre");
    const bears = spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Island");
    expect(() => cast(game, pyre, { x: 2, targets: [ref(bears)] })).toThrow(/too few cards in their graveyard/);
  });

  it("counts only the filter's cards (Chill Haunting)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const haunting = toHand(game, "Chill Haunting");
    const target = spawn(game, "Hill Giant", B);
    const land = toGraveyard(game, "Island");
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Grizzly Bears");
    expect(offer(game, haunting)?.xCost?.maxX).toBe(2);
    cast(game, haunting, { x: 2, targets: [ref(target)] });
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(pt(game, target)).toEqual({ power: 1, toughness: 1 });
  });

  it("one X pays the mana and the cards, capped by the fewer (Skeletal Scrying)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const scrying = toHand(game, "Skeletal Scrying");
    expect(offer(game, scrying)?.xCost?.maxX).toBe(0);
    const first = toGraveyard(game, "Island");
    const second = toGraveyard(game, "Island");
    expect(offer(game, scrying)?.xCost?.maxX).toBe(2);
    const rest = [toGraveyard(game, "Island"), toGraveyard(game, "Island"), toGraveyard(game, "Island")];
    // Now the three lands left after {B} are the limit.
    expect(offer(game, scrying)?.xCost?.maxX).toBe(3);
    pickFromZone(a, first, second);
    const before = hand(game).length;
    cast(game, scrying, { x: 2 });
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(life(game)).toBe(18);
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    expect(rest.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
  });

  it("cast from a graveyard, the spell can't pay for itself", () => {
    const { game } = table();
    const pyre = toGraveyard(game, "Harvest Pyre");
    const other = toGraveyard(game, "Island");
    const candidates = game as unknown as {
      graveyardCostCandidates(p: typeof A, f: undefined, except: ObjectId): readonly ObjectId[];
    };
    expect(candidates.graveyardCostCandidates(A, undefined, pyre)).toEqual([other]);
  });

  it("a copy keeps the X, and exiles nothing of its own (rule 707.10)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const pyre = toHand(game, "Harvest Pyre");
    const wurm = spawn(game, "Craw Wurm", B);
    toGraveyard(game, "Island");
    toGraveyard(game, "Island");
    cast(game, pyre, { x: 2, targets: [ref(wurm)], settle: false });
    lands(game, "Island", 2);
    const twincast = toHand(game, "Twincast");
    cast(game, twincast, { targets: [ref(pyre)] });
    // 2 and 2: a 4-toughness creature dies, and no more cards were needed.
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("the exiled card of a spell's additional cost", () => {
  it("reads its power (Corpse Explosion): each creature and each planeswalker", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 1);
    const explosion = toHand(game, "Corpse Explosion");
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const mine = spawn(game, "Grizzly Bears");
    const exiled = toGraveyard(game, "Hill Giant");
    const other = toGraveyard(game, "Grizzly Bears");
    pickFromZone(a, exiled);
    cast(game, explosion);
    expect(zone(game, exiled)).toBe("exile");
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });

  it("reads the card as it is, not as it last was on the battlefield", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 1);
    const explosion = toHand(game, "Corpse Explosion");
    const wurm = spawn(game, "Craw Wurm", B);
    const died = spawn(game, "Grizzly Bears");
    game.state.objects[died].counters["+1/+1"] = 3;
    game.debugMove(died, "graveyard");
    expect(graveyard(game)).toContain(died);
    cast(game, explosion);
    expect(zone(game, died)).toBe("exile");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("a copy reads the same card (rule 707.10)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 1);
    const explosion = toHand(game, "Corpse Explosion");
    const wurm = spawn(game, "Craw Wurm", B);
    toGraveyard(game, "Hill Giant");
    cast(game, explosion, { settle: false });
    lands(game, "Island", 2);
    const twincast = toHand(game, "Twincast");
    cast(game, twincast, { targets: [ref(explosion)] });
    // 3 and 3: a 4-toughness creature dies, which one alone wouldn't do.
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("can't be cast with no creature card there", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 1);
    const explosion = toHand(game, "Corpse Explosion");
    toGraveyard(game, "Island");
    expect(offer(game, explosion)).toBeUndefined();
  });

  it("reads its mana value, spares Dragons, exiles what dies and itself (Draconic Intervention)", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const intervention = toHand(game, "Draconic Intervention");
    const bears = spawn(game, "Grizzly Bears", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const instant = toGraveyard(game, "Divination");
    cast(game, intervention);
    expect(zone(game, instant)).toBe("exile");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    expect(game.state.objects[dragon].damageMarked).toBe(0);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, intervention)).toBe("exile");
  });
});

describe("you may exile a card as the spell's additional cost, linked to the permanent", () => {
  it("is cast with an empty graveyard, and doesn't grow (Redemptor Dreadnought)", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const dread = toHand(game, "Redemptor Dreadnought");
    cast(game, dread);
    expect(zone(game, dread)).toBe("battlefield");
    game.state.objects[dread].summoningSick = false;
    attack(game, a, [dread]);
    expect(pt(game, dread)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, B)).toBe(16);
  });

  it("asks even with one card there, and none is an answer", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const dread = toHand(game, "Redemptor Dreadnought");
    const giant = toGraveyard(game, "Hill Giant");
    const seen = pickFromZone(a);
    cast(game, dread);
    expect(seen.offered).toEqual([giant]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, dread)).toBe("battlefield");
  });

  it("the card exiled is exiled with it: it attacks for that much more", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const dread = toHand(game, "Redemptor Dreadnought");
    const giant = toGraveyard(game, "Hill Giant");
    const land = toGraveyard(game, "Island");
    const seen = pickFromZone(a, giant);
    cast(game, dread);
    expect(seen.offered).not.toContain(land);
    expect(zone(game, giant)).toBe("exile");
    game.state.objects[dread].summoningSick = false;
    attack(game, a, [dread]);
    expect(pt(game, dread)).toEqual({ power: 7, toughness: 7 });
    expect(life(game, B)).toBe(13);
  });

  it("a card no longer in exile isn't exiled with it", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const dread = toHand(game, "Redemptor Dreadnought");
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    cast(game, dread);
    expect(game.state.objects[giant].exiledWith?.source).toBe(dread);
    game.debugMove(giant, "hand");
    game.state.objects[dread].summoningSick = false;
    attack(game, a, [dread]);
    expect(pt(game, dread)).toEqual({ power: 4, toughness: 4 });
  });

});

describe("a count read as it's activated", () => {
  it("exiles one card for one opponent, gives the target encore (Araumi of the Dead Tide)", () => {
    const { game, a } = table();
    const araumi = spawn(game, "Araumi of the Dead Tide");
    const bears = toGraveyard(game, "Grizzly Bears");
    const fodder = toGraveyard(game, "Island");
    pickFromZone(a, fodder);
    activate(game, araumi, 0, { targets: [ref(bears)] });
    expect(zone(game, fodder)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    // Encore: its own mana cost, from the graveyard.
    lands(game, "Forest", 2);
    const encore = game.legalActions(A).find((x) => x.kind === "activate-ability" && x.source === bears);
    expect(encore).toBeDefined();
  });

  it("needs a card per opponent still in the game (four players)", () => {
    const { game } = table({ players: 4 });
    const araumi = spawn(game, "Araumi of the Dead Tide");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Island");
    const can = (): boolean => game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === araumi);
    expect(can()).toBe(false);
    toGraveyard(game, "Island");
    expect(can()).toBe(true);
  });

  it("the target may be exiled to pay for it, with no effect left (the only card there)", () => {
    const { game } = table();
    const araumi = spawn(game, "Araumi of the Dead Tide");
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, araumi, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });
});
