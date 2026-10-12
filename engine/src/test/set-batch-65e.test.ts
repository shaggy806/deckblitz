/**
 * The set walk, batch 65, part e (2026-10-12): Avatar: The Last Airbender's
 * airbend cards (rule 701.65a). Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const airbended = (game: Game, id: ObjectId): boolean =>
  game.state.objects[id]?.zone === "exile" && game.state.objects[id]?.airbended === true;

const airbendOffers = (game: Game, card: ObjectId, player: PlayerId) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "airbend");

describe("Aang, the Last Airbender", () => {
  it("airbends up to one other nonland permanent, and gains lifelink as you cast a Lesson", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const seen: ObjectId[][] = [];
    a.chooseTargetsFn = (_v, _n, _specs, options) => {
      seen.push(options[0].map((t) => (t.kind === "object" ? t.object : (t.player as unknown as ObjectId))));
      return [ref(giant)];
    };
    const aang = enter(game, "Aang, the Last Airbender");
    expect(seen[0]).not.toContain(aang);
    expect(airbended(game, giant)).toBe(true);
    expect(keywords(game, aang).has("lifelink")).toBe(false);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Airbending Lesson"), { targets: [ref(bears)] });
    expect(keywords(game, aang).has("lifelink")).toBe(true);
    nextTurn(game);
    expect(keywords(game, aang).has("lifelink")).toBe(false);
  });
});

describe("Airbender Ascension", () => {
  it("airbends on entering, counts creatures entering, and blinks one at your end step with four counters", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const ascension = enter(game, "Airbender Ascension");
    expect(airbended(game, giant)).toBe(true);
    for (let i = 0; i < 3; i += 1) enter(game, "Grizzly Bears");
    expect(counters(game, ascension, "quest")).toBe(3);
    // Three: the end step's "if" isn't met.
    const bears = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears")!;
    pickTargets(a, bears);
    toStep(game, "end");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    nextTurn(game);
    toStep(game, "precombat-main");
    enter(game, "Grizzly Bears");
    expect(counters(game, ascension, "quest")).toBe(4);
    const before = game.state.objects[bears].zoneChangeCount ?? 0;
    toStep(game, "end");
    settle(game);
    // Exiled and returned: a new object, still on the battlefield, which
    // re-entering added a fifth counter.
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].zoneChangeCount ?? 0).toBeGreaterThan(before);
    expect(counters(game, ascension, "quest")).toBe(5);
  });
});

describe("Airbender's Reversal", () => {
  it("destroys an attacking creature, or airbends one of yours", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Airbender's Reversal"), { modes: [1], targets: [ref(mine)] });
    expect(airbended(game, mine)).toBe(true);
    expect(airbendOffers(game, mine, A)).toHaveLength(0); // the lands are tapped
    lands(game, "Wastes", 2);
    expect(airbendOffers(game, mine, A)).toHaveLength(1);
    // A creature that isn't attacking can't be the destroy mode's target.
    const theirs = spawn(game, "Hill Giant", B);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: toHand(game, "Airbender's Reversal"), targets: [ref(theirs)], modes: [0] }),
    ).not.toBeNull();
  });
});

describe("Airbending Lesson", () => {
  it("airbends a nonland permanent and draws a card", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Airbending Lesson"), { targets: [ref(giant)] });
    expect(airbended(game, giant)).toBe(true);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Appa, Loyal Sky Bison", () => {
  it("entering airbends another nonland permanent you control; attacking gives flying", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, bears);
    const appa = enter(game, "Appa, Loyal Sky Bison");
    expect(airbended(game, bears)).toBe(true);
    expect(zone(game, appa)).toBe("battlefield");
    const walker = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, walker);
    attack(game, a, [appa]);
    expect(keywords(game, walker).has("flying")).toBe(true);
  });
});

describe("Appa, Steadfast Guardian", () => {
  it("airbends any number of your other nonland permanents together, and makes an Ally for each spell cast from exile", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    a.chooseTargetsFn = () => [ref(bears), ref(giant)];
    enter(game, "Appa, Steadfast Guardian");
    expect(airbended(game, bears)).toBe(true);
    expect(airbended(game, giant)).toBe(true);
    // (The test entry ran on into combat; back to a main phase.)
    toStep(game, "postcombat-main");
    lands(game, "Wastes", 4);
    cast(game, giant, { via: "airbend" });
    expect(zone(game, giant)).toBe("battlefield");
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
    // A spell cast from the hand makes none.
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
  });
});

describe("Avatar's Wrath", () => {
  it("spares the chosen creature, airbends the rest, and keeps opponents to their hands until your next turn", () => {
    const { game } = table();
    const keep = spawn(game, "Hill Giant");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    lands(game, "Wastes", 2);
    const wrath = toHand(game, "Avatar's Wrath");
    cast(game, wrath, { targets: [ref(keep)] });
    expect(zone(game, keep)).toBe("battlefield");
    expect(airbended(game, mine)).toBe(true);
    expect(airbended(game, theirs)).toBe(true);
    expect(zone(game, wrath)).toBe("exile");
    // Alice isn't bound by it: she recasts hers for {2}.
    cast(game, mine, { via: "airbend" });
    expect(zone(game, mine)).toBe("battlefield");
    // Bob's turn: his airbended Bears can't be cast, a card from his hand can.
    nextTurn(game);
    lands(game, "Forest", 4, B);
    expect(airbendOffers(game, theirs, B)).toHaveLength(0);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    // Alice's next turn ends it; on bob's following turn he may.
    nextTurn(game);
    nextTurn(game);
    lands(game, "Wastes", 2, B);
    expect(airbendOffers(game, theirs, B)).toHaveLength(1);
  });

  it("with no creature chosen, airbends them all; a token is gone", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    cast(game, toHand(game, "Raise the Alarm"));
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Avatar's Wrath"), { targets: [null] });
    expect(airbended(game, bears)).toBe(true);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });
});

describe("Glider Staff", () => {
  it("airbends up to one creature as it enters; the equipped creature gets +1/+1 and flying", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const staff = enter(game, "Glider Staff");
    expect(airbended(game, giant)).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    toStep(game, "postcombat-main");
    activate(game, staff, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Monk Gyatso", () => {
  it("may airbend another creature you control as it becomes a target — the spell then has no legal target", () => {
    const { game, a } = table();
    const monk = spawn(game, "Monk Gyatso");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    nextTurn(game);
    lands(game, "Swamp", 2, B);
    const murder = toHand(game, "Murder", B);
    lands(game, "Swamp", 1, B);
    cast(game, murder, { player: B, targets: [ref(bears)] });
    expect(airbended(game, bears)).toBe(true);
    expect(graveyard(game, B)).toContain(murder);
    // Gyatso himself targeted: no trigger ("another").
    const murder2 = toHand(game, "Murder", B);
    lands(game, "Swamp", 3, B);
    cast(game, murder2, { player: B, targets: [ref(monk)] });
    expect(zone(game, monk)).toBe("graveyard");
  });

  it("declining leaves it there", () => {
    const { game, a } = table();
    spawn(game, "Monk Gyatso");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Whirlwind Technique", () => {
  it("target player draws two then discards one, and up to two creatures are airbended", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    lands(game, "Island", 6);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Whirlwind Technique"), { targets: [ref(B), ref(one), ref(two)] });
    expect(hand(game, B).length).toBe(before + 1);
    expect(airbended(game, one)).toBe(true);
    expect(airbended(game, two)).toBe(true);
  });
});
