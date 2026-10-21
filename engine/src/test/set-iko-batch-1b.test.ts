/**
 * Ikoria: Lair of Behemoths, group b: Primal Empathy, Cunning Nightbonder,
 * Hornbash Mentor, Avian Oddity, Bushmeat Poacher, Survivors' Bond, Boot
 * Nipper, Will of the All-Hunter, Clash of Titans, Voracious Greatshark,
 * Spelleater Wolverine, Lurking Deadeye and Perimeter Sergeant — each on the
 * clause most likely to be wrong.
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
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const cycle = (game: Game, name: string): ObjectId => {
  const card = toHand(game, name);
  game.dispatch({ type: "cycle", player: A, card });
  return card;
};

describe("Primal Empathy", () => {
  it("draws when you control a creature tied for the greatest power", () => {
    const { game } = table();
    spawn(game, "Primal Empathy");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Hill Giant", B);
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, giant)).toBe(0);
  });

  it("otherwise puts a +1/+1 counter on a creature you choose, and draws nothing", () => {
    const { game, a } = table();
    spawn(game, "Primal Empathy");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    toStep(game, "upkeep");
    const seen = pickPermanents(a, other);
    const before = hand(game).length;
    settle(game);
    expect([...seen.offered].sort()).toEqual([bears, other].sort());
    expect(counters(game, other)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(hand(game).length).toBe(before);
  });
});

describe("Cunning Nightbonder", () => {
  it("spells with flash you cast cost {1} less and can't be countered", () => {
    const { game } = table();
    spawn(game, "Cunning Nightbonder");
    lands(game, "Swamp", 3);
    const deadeye = toHand(game, "Lurking Deadeye");
    // {3}{B} for three lands: the discount is there.
    cast(game, deadeye, { settle: false });
    expect(zone(game, deadeye)).toBe("stack");
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(deadeye)]);
    expect(zone(game, deadeye)).toBe("stack");
    settle(game);
    expect(zone(game, deadeye)).toBe("battlefield");
  });

  it("a spell without flash is neither cheaper nor protected", () => {
    const { game } = table();
    spawn(game, "Cunning Nightbonder");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears)).toThrow();
    lands(game, "Forest", 1);
    cast(game, bears, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(bears)]);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Hornbash Mentor", () => {
  it("puts a trample counter only on a non-Human; its ability pumps each trampler", () => {
    const { game, a } = table();
    const human = spawn(game, "Bushmeat Poacher");
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    const mentor = enter(game, "Hornbash Mentor");
    // The only non-Human creature you control: chosen without asking.
    if (seen.asked > 0) expect(seen.offered[0]).toEqual([bears]);
    expect(counters(game, human, "trample")).toBe(0);
    expect(counters(game, mentor, "trample")).toBe(0);
    expect(counters(game, bears, "trample")).toBe(1);
    lands(game, "Forest", 3);
    activate(game, mentor, 0);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, human)).toBe(0);
    expect(counters(game, mentor)).toBe(0);
  });
});

describe("Avian Oddity", () => {
  it("cycling it puts a flying counter on a creature you control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const before = hand(game).length;
    const oddity = cycle(game, "Avian Oddity");
    settle(game);
    expect(zone(game, oddity)).toBe("graveyard");
    expect(counters(game, bears, "flying")).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Bushmeat Poacher", () => {
  it("gains life equal to the sacrificed creature's toughness and draws one card", () => {
    const { game } = table();
    const poacher = spawn(game, "Bushmeat Poacher");
    const wurm = spawn(game, "Craw Wurm");
    lands(game, "Swamp", 1);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: poacher, abilityIndex: 0, targets: [], sacrifice: wurm });
    settle(game);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, poacher)).toBe("battlefield");
    expect(life(game)).toBe(24);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Survivors' Bond", () => {
  it("both modes return a Human and a non-Human creature card", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const human = toGraveyard(game, "Bushmeat Poacher");
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Survivors' Bond"), { modes: [0, 1], targets: [ref(human), ref(bears)] });
    expect(zone(game, human)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
  });

  it("the Human mode can't take a non-Human", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Survivors' Bond"), { modes: [0], targets: [ref(bears)] })).toThrow();
  });
});

describe("Boot Nipper", () => {
  it("enters with the chosen counter", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    a.chooseCreatureTypeFn = () => "lifelink";
    const nipper = toHand(game, "Boot Nipper");
    cast(game, nipper);
    expect(counters(game, nipper, "lifelink")).toBe(1);
    expect(counters(game, nipper, "deathtouch")).toBe(0);
    expect(keywords(game, nipper).has("lifelink")).toBe(true);
  });
});

describe("Will of the All-Hunter", () => {
  it("on a blocking creature: two +1/+1 counters instead of +2/+2", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    cast(game, toHand(game, "Will of the All-Hunter"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("on a creature that isn't blocking: +2/+2 and no counters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Will of the All-Hunter"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Clash of Titans", () => {
  it("can make two creatures of the same player fight", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Clash of Titans"), { targets: [ref(wurm), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });
});

describe("Voracious Greatshark", () => {
  it("counters a creature spell as it enters", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    // Flashed in on top of it: the Greatshark resolves first, and its
    // trigger counters the Bears below.
    lands(game, "Island", 5);
    pickTargets(a, bears);
    const shark = toHand(game, "Voracious Greatshark");
    cast(game, shark);
    expect(zone(game, shark)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Spelleater Wolverine", () => {
  it("has double strike only with three or more instant and/or sorcery cards in your graveyard", () => {
    const { game } = table();
    const wolverine = spawn(game, "Spelleater Wolverine");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    expect(keywords(game, wolverine).has("double-strike")).toBe(false);
    toGraveyard(game, "Shock");
    expect(keywords(game, wolverine).has("double-strike")).toBe(true);
    expect(graveyard(game)).toHaveLength(4);
  });
});

describe("Lurking Deadeye", () => {
  it("destroys a creature that was dealt damage this turn, never an undamaged one", () => {
    const { game, a } = table();
    const hurt = spawn(game, "Craw Wurm", B);
    const fresh = spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(hurt)] });
    expect(game.state.objects[hurt].damageMarked).toBe(2);
    const seen = watchTargets(a, () => [hurt]);
    enter(game, "Lurking Deadeye");
    if (seen.asked > 0) expect(seen.offered[0]).toEqual([hurt]);
    expect(zone(game, hurt)).toBe("graveyard");
    expect(zone(game, fresh)).toBe("battlefield");
  });
});

describe("Perimeter Sergeant", () => {
  it("pumps only the other Humans you control", () => {
    const { game, a } = table();
    const sergeant = spawn(game, "Perimeter Sergeant");
    const human = spawn(game, "Bushmeat Poacher");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [sergeant]);
    expect(pt(game, human)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, sergeant)).toEqual({ power: 3, toughness: 2 });
    expect(life(game, B)).toBe(17);
  });
});
