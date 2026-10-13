/**
 * Card batch 70, part c (2026-10-12): EDHREC ranks 7128–7178. Written on the
 * shared table in `harness.ts`.
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
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
  destroy,
} from "./harness.js";

const canActivate = (game: Game, source: ObjectId, index: number, targets: readonly ObjectId[] = []): boolean =>
  game.canDispatch({
    type: "activate-ability",
    player: A,
    source,
    abilityIndex: index,
    targets: targets.map(ref),
  }) === null;

describe("Krile Baldesion", () => {
  it("returns a creature card with the spell's mana value, only once each turn", () => {
    const { game, a } = table();
    spawn(game, "Krile Baldesion");
    lands(game, "Mountain", 2);
    const lions = toGraveyard(game, "Savannah Lions"); // mana value 1
    const lions2 = toGraveyard(game, "Savannah Lions");
    toGraveyard(game, "Grizzly Bears"); // mana value 2: never offered for a Bolt
    const seen = watchTargets(a, (offered) => [offered[0][0] ?? null]);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual([lions, lions2]);
    expect(zone(game, lions)).toBe("hand");
    // A second noncreature spell this turn: the trigger still targets, but
    // the return has been done this turn.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(zone(game, lions2)).toBe("graveyard");
  });
});

describe("Sapseep Forest", () => {
  it("gains life only while you control two or more green permanents", () => {
    const { game } = table();
    const sapseep = spawn(game, "Sapseep Forest");
    // It enters tapped; untap it to test the life gain.
    expect(game.state.objects[sapseep].tapped).toBe(true);
    game.state.objects[sapseep].tapped = false;
    lands(game, "Forest", 1);
    spawn(game, "Llanowar Elves");
    expect(canActivate(game, sapseep, 1)).toBe(false);
    spawn(game, "Llanowar Elves");
    activate(game, sapseep, 1);
    expect(life(game, A)).toBe(21);
  });
});

describe("Afterlife Insurance", () => {
  it("gives your creatures afterlife 1 for the turn, and draws", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const card = toHand(game, "Afterlife Insurance");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before); // the card cast, one drawn
    destroy(game, bears);
    destroy(game, theirs);
    expect(tokensNamed(game, "Spirit Token (White-Black)", A)).toBe(1);
    expect(tokensNamed(game, "Spirit Token (White-Black)", B)).toBe(0);
  });
});

describe("Bounty Agent", () => {
  it("destroys only a legendary artifact, creature or enchantment", () => {
    const { game } = table();
    const agent = spawn(game, "Bounty Agent");
    const bears = spawn(game, "Grizzly Bears", B);
    const krile = spawn(game, "Krile Baldesion", B);
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === agent && o.abilityIndex === 0);
    if (offer?.kind !== "activate-ability") throw new Error("no offer");
    const options = offer.targetOptions[0].map((t) => (t.kind === "object" ? t.object : t.player));
    expect(options).toContain(krile);
    expect(options).not.toContain(bears);
    activate(game, agent, 0, { targets: [ref(krile)] });
    expect(zone(game, krile)).toBe("graveyard");
    expect(zone(game, agent)).toBe("graveyard");
  });
});

describe("Graveborn Muse", () => {
  it("draws X and loses X at your upkeep, X the Zombies you control", () => {
    const { game } = table();
    spawn(game, "Graveborn Muse");
    spawn(game, "Diregraf Ghoul");
    spawn(game, "Diregraf Ghoul", B); // not yours
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
  });
});

describe("Fumiko the Lowblood", () => {
  it("bushido X counts every attacking creature as it resolves", () => {
    const { game, a, b } = table();
    const fumiko = spawn(game, "Fumiko the Lowblood");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B); // 3/3
    b.declareBlockersFn = () => [{ blocker: giant, attacker: fumiko }];
    attack(game, a, [fumiko, bears]);
    // 3/2 + 2/2 for two attackers: kills the Giant and survives it.
    expect(pt(game, fumiko)).toEqual({ power: 5, toughness: 4 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, fumiko)).toBe("battlefield");
  });
});

describe("Dogged Detective", () => {
  it("returns from your graveyard when an opponent draws their second card in a turn", () => {
    const { game, a } = table();
    const detective = toGraveyard(game, "Dogged Detective");
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(zone(game, detective)).toBe("graveyard");
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(zone(game, detective)).toBe("hand");
  });
});

describe("Vaan, Street Thief", () => {
  it("casts the exiled card — a spell it doesn't own, which grows the Scouts", () => {
    const { game, a } = table();
    const vaan = spawn(game, "Vaan, Street Thief");
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears", B);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bears);
      return way === undefined ? null : { type: "cast-spell", player: A, card: bears, targets: [], via: way.via };
    };
    attack(game, a, [vaan]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(counters(game, vaan)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("makes a Treasure when the card isn't cast", () => {
    const { game, a } = table();
    const vaan = spawn(game, "Vaan, Street Thief");
    const bears = toLibrary(game, "Grizzly Bears", B);
    a.chooseCastNowFn = () => null;
    attack(game, a, [vaan]);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(counters(game, vaan)).toBe(0);
  });
});

describe("Electrolyze", () => {
  it("splits 2 damage 1 and 1 between two targets, and draws", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    const card = toHand(game, "Electrolyze");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(bears), ref(B)], division: [1, 1] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before);
  });
});

describe("Indomitable Archangel", () => {
  it("gives your artifacts shroud only with three or more artifacts", () => {
    const { game } = table();
    spawn(game, "Indomitable Archangel");
    const [first] = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter")];
    const theirs = spawn(game, "Ornithopter", B);
    expect(keywords(game, first).has("shroud")).toBe(false);
    spawn(game, "Ornithopter");
    expect(keywords(game, first).has("shroud")).toBe(true);
    expect(keywords(game, theirs).has("shroud")).toBe(false);
  });
});

describe("Writhing Chrysalis", () => {
  it("makes two Spawn as it's cast, and grows when you sacrifice another Eldrazi", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Writhing Chrysalis"));
    const [chrysalis] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Writhing Chrysalis");
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(2);
    const [spawnToken] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Eldrazi Spawn Token");
    activate(game, spawnToken, 0);
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(1);
    expect(counters(game, chrysalis)).toBe(1);
  });
});

describe("Ray Fillet, Wave Warrior", () => {
  it("draws when a creature you control with a counter deals combat damage to a player", () => {
    const { game, a } = table();
    spawn(game, "Ray Fillet, Wave Warrior");
    const countered = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(countered)]);
    const before = hand(game).length;
    attack(game, a, [countered, plain]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Thassa's Intervention", () => {
  it("counters unless its controller pays twice X", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    lands(game, "Island", 4);
    cast(game, toHand(game, "Thassa's Intervention"), { x: 2, modes: [1], targets: [ref(bears)], settle: false });
    // Four more lands: paying twice X ({4}) taps every one of them.
    const spare = lands(game, "Wastes", 4);
    pickModes(a, 0);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(spare.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("counters the spell when its controller doesn't pay", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    lands(game, "Island", 4);
    cast(game, toHand(game, "Thassa's Intervention"), { x: 2, modes: [1], targets: [ref(bears)], settle: false });
    pickModes(a);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("puts up to two of the top X into your hand", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Hill Giant"), toLibrary(game, "Savannah Lions")];
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    cast(game, toHand(game, "Thassa's Intervention"), { x: 3, modes: [0] });
    expect(top.filter((id) => zone(game, id) === "hand")).toHaveLength(2);
    expect(top.filter((id) => zone(game, id) === "library")).toHaveLength(1);
    expect(graveyard(game)).toHaveLength(1); // the Intervention itself
  });
});

