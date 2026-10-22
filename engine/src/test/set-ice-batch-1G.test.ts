/**
 * Ice Age (ICE; B136), group G. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const grantedIndex = (game: Game, source: ObjectId): number => {
  const offers = game
    .legalActions(A)
    .filter((a): a is Extract<typeof a, { kind: "activate-ability" }> => a.kind === "activate-ability" && a.source === source);
  return Math.max(...offers.map((a) => a.abilityIndex));
};
/** Activate `source`'s ability `index`, sacrificing `fodder` for its cost. */
const activateSacrificing = (game: Game, source: ObjectId, index: number, fodder: ObjectId): void => {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [], sacrifice: fodder });
  settle(game);
};

describe("Time Bomb", () => {
  it("deals damage equal to its time counters, as it was sacrificed, to each creature and each player", () => {
    const { game } = table();
    const bomb = spawn(game, "Time Bomb");
    game.state.objects[bomb].counters.time = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    activate(game, bomb, 0);
    expect(zone(game, bomb)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Thoughtleech", () => {
  it("offers 1 life when an opponent's Island becomes tapped, not your own", () => {
    const { game, a } = table();
    spawn(game, "Thoughtleech");
    const mine = spawn(game, "Island");
    const theirs = spawn(game, "Island", B);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(mine)]);
    settle(game);
    expect(life(game, A)).toBe(20);
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(life(game, A)).toBe(21);
  });
});

describe("Whiteout", () => {
  it("returns from the graveyard by sacrificing a snow land, then takes flying from every creature", () => {
    const { game } = table();
    const whiteout = toGraveyard(game, "Whiteout");
    const snow = spawn(game, "Snow-Covered Forest");
    activateSacrificing(game, whiteout, 0, snow);
    expect(zone(game, snow)).toBe("graveyard");
    expect(zone(game, whiteout)).toBe("hand");
    const drake = spawn(game, "Wind Drake", B);
    lands(game, "Forest", 2);
    cast(game, whiteout);
    expect(keywords(game, drake).has("flying")).toBe(false);
  });
});

describe("Onyx Talisman", () => {
  it("untaps the target when a black spell is cast and {3} is paid", () => {
    const { game, a } = table();
    spawn(game, "Onyx Talisman");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 3);
    pickTargets(a, tapped);
    pickModes(a, 0);
    cast(game, toHand(game, "Dark Ritual"));
    expect(isTapped(game, tapped)).toBe(false);
  });
});

describe("Caribou Range", () => {
  it("gives the land a Caribou maker, and a Caribou token sacrificed gains 1 life", () => {
    const { game } = table();
    const land = spawn(game, "Wastes");
    lands(game, "Plains", 4);
    const range = toHand(game, "Caribou Range");
    cast(game, range, { targets: [ref(land)] });
    game.state.objects[land].tapped = false;
    lands(game, "Plains", 2);
    activate(game, land, grantedIndex(game, land));
    expect(isTapped(game, land)).toBe(true);
    expect(tokensNamed(game, "Caribou Token", A)).toBe(1);
    activateSacrificing(game, range, 0, named(game, "Caribou Token", A)[0]);
    expect(tokensNamed(game, "Caribou Token", A)).toBe(0);
    expect(life(game, A)).toBe(21);
  });
});

describe("Cloak of Confusion", () => {
  it("unblocked, the enchanted creature may deal no combat damage to make the defender discard at random", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Cloak of Confusion"), { targets: [ref(bears)] });
    const before = hand(game, B).length;
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Lava Tubes", () => {
  it("takes a depletion counter when tapped for mana, skips one untap step, and loses the counter at upkeep", () => {
    const { game } = table();
    const tubes = spawn(game, "Lava Tubes");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(isTapped(game, tubes)).toBe(true);
    expect(game.state.objects[tubes].counters.depletion).toBe(1);
    toStep(game, "precombat-main"); // alice's next turn: still tapped, counter gone at upkeep
    expect(isTapped(game, tubes)).toBe(true);
    expect(game.state.objects[tubes].counters.depletion ?? 0).toBe(0);
    toStep(game, "precombat-main"); // and the turn after, it untaps
    expect(isTapped(game, tubes)).toBe(false);
  });
});

describe("Earthlink", () => {
  it("makes a dead creature's controller sacrifice a land", () => {
    const { game } = table();
    spawn(game, "Earthlink");
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    const mine = spawn(game, "Forest");
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Aurochs", () => {
  it("gets +1/+0 for each other attacking Aurochs", () => {
    const { game, a } = table();
    const herd = [spawn(game, "Aurochs"), spawn(game, "Aurochs"), spawn(game, "Aurochs")];
    a.declareAttackersFn = () => herd.map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    expect(pt(game, herd[0])).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Soldevi Golem", () => {
  it("stays tapped, but untaps itself at upkeep by untapping an opponent's tapped creature", () => {
    const { game, a } = table();
    const golem = spawn(game, "Soldevi Golem", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    game.state.objects[bears].tapped = true;
    pickTargets(a, bears);
    pickModes(a);
    toStep(game, "precombat-main");
    expect(isTapped(game, golem)).toBe(true);
    expect(isTapped(game, bears)).toBe(true);
    pickModes(a, 0);
    toStep(game, "precombat-main", B);
    game.state.objects[bears].tapped = true;
    toStep(game, "precombat-main");
    expect(isTapped(game, golem)).toBe(false);
    expect(isTapped(game, bears)).toBe(false);
  });
});

describe("Celestial Sword", () => {
  it("pumps the creature, and whoever controls it at the end step sacrifices it", () => {
    const { game } = table();
    const sword = spawn(game, "Celestial Sword");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, sword, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Krovikan Elementalist", () => {
  it("gives flying, then its activator sacrifices the creature at the end step", () => {
    const { game } = table();
    const elementalist = spawn(game, "Krovikan Elementalist");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    activate(game, elementalist, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Cold Snap", () => {
  it("deals each player damage equal to the snow lands they control at their upkeep", () => {
    const { game } = table();
    spawn(game, "Cold Snap");
    lands(game, "Snow-Covered Forest", 2, B);
    lands(game, "Forest", 1, B);
    toStep(game, "precombat-main", B);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Johtull Wurm", () => {
  it("gets -2/-1 for each blocker beyond the first", () => {
    const { game, a, b } = table();
    const wurm = enter(game, "Johtull Wurm");
    const blockers = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    b.declareBlockersFn = () => blockers.map((blocker) => ({ blocker, attacker: wurm }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && quiet(s) && s.priority.holder === A);
    expect(pt(game, wurm)).toEqual({ power: 2, toughness: 4 });
  });
});
