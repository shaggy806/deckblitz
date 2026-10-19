/**
 * The set walk, The Brothers' War batch 1, part b (2026-10-19): Powerstone makers, prototype,
 * the "milled this way" commons, the artifact-discard Prodigies and the rest of group b.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const castOffers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game
    .legalActions(player)
    .filter((x): x is Extract<LegalAction, { kind: "cast-spell" }> => x.kind === "cast-spell" && x.card === card);
const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean => castOffers(game, card, player).length > 0;
const canActivate = (game: Game, source: ObjectId, index: number, player: PlayerId = A): boolean =>
  game
    .legalActions(player)
    .some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;
const tokens = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].cardName === name);
const pool = (game: Game, player: PlayerId = A): number => game.state.players[player].manaPool.length;

describe("Giant Cindermaw", () => {
  it("stops every player gaining life", () => {
    const { game } = table();
    spawn(game, "Giant Cindermaw", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
    expect(keywords(game, named(game, "Giant Cindermaw")[0]).has("trample")).toBe(true);
  });
});

describe("Transmogrant's Crown", () => {
  it("equips for {B}, gives +2/+0, and draws when the equipped creature dies", () => {
    const { game } = table();
    const crown = spawn(game, "Transmogrant's Crown");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    // Equip {2} isn't affordable off one Swamp; equip {B} is.
    expect(canActivate(game, crown, 0)).toBe(false);
    expect(canActivate(game, crown, 1)).toBe(true);
    activate(game, crown, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Ashnod, Flesh Mechanist", () => {
  it("may sacrifice another creature as it attacks for a tapped Powerstone", () => {
    const { game, a } = table();
    const ashnod = spawn(game, "Ashnod, Flesh Mechanist");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    attack(game, a, [ashnod]);
    expect(zone(game, bears)).toBe("graveyard");
    const stones = tokens(game, "Powerstone Token");
    expect(stones).toHaveLength(1);
    expect(tapped(game, stones[0])).toBe(true);
  });

  it("exiles a creature card from your graveyard for a tapped 3/3 colorless Zombie artifact", () => {
    const { game, a } = table();
    const ashnod = spawn(game, "Ashnod, Flesh Mechanist");
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Wastes", 5);
    pickFromZone(a, giant);
    activate(game, ashnod, 0);
    expect(zone(game, giant)).toBe("exile");
    const [zombie] = tokens(game, "Zombie Token (Ashnod, Flesh Mechanist)");
    expect(zombie).toBeDefined();
    expect(tapped(game, zombie)).toBe(true);
    expect(pt(game, zombie)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, zombie)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect([...game.characteristics(zombie).colors]).toEqual([]);
  });
});

describe("Draconic Destiny", () => {
  it("makes a flying, hasty Dragon with a firebreathing ability, and returns to hand as its host dies", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const destiny = toHand(game, "Draconic Destiny");
    a.chooseEnchantFn = () => bears;
    cast(game, destiny, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Dragon"]));
    // The granted "{1}: This creature gets +1/+0" is the creature's own.
    const pump = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === bears);
    expect(pump).toBeDefined();
    if (pump?.kind !== "activate-ability") throw new Error("no granted ability");
    activate(game, bears, pump.abilityIndex);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    destroy(game, bears);
    expect(zone(game, destiny)).toBe("hand");
  });

  it("stays put if the card has left the graveyard before the trigger resolves (rule 400.7)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    const destiny = toHand(game, "Draconic Destiny");
    a.chooseEnchantFn = () => bears;
    cast(game, destiny, { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    expect(zone(game, destiny)).toBe("graveyard");
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(destiny)]);
    settle(game);
    expect(zone(game, destiny)).toBe("exile");
  });
});

describe("Blanchwood Prowler", () => {
  it("takes a milled land card instead of the counter", () => {
    const { game, a } = table();
    toLibrary(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, forest);
    const prowler = enter(game, "Blanchwood Prowler");
    expect(zone(game, forest)).toBe("hand");
    expect(counters(game, prowler)).toBe(0);
  });

  it("gets the counter with no land among the milled cards", () => {
    const { game } = table();
    toLibrary(game, "Hill Giant");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Lightning Bolt");
    const prowler = enter(game, "Blanchwood Prowler");
    expect(counters(game, prowler)).toBe(1);
  });

  it("still finds a milled land Rest in Peace exiled instead (rule 701.17c)", () => {
    const { game, a } = table();
    spawn(game, "Rest in Peace", B);
    toLibrary(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickFromZone(a, forest);
    const prowler = enter(game, "Blanchwood Prowler");
    expect(seen.offered).toContain(forest);
    expect(zone(game, forest)).toBe("hand");
    expect(counters(game, prowler)).toBe(0);
  });
});

describe("Urza, Powerstone Prodigy", () => {
  it("makes one tapped Powerstone a turn for discarding artifact cards", () => {
    const { game, a } = table();
    const urza = spawn(game, "Urza, Powerstone Prodigy");
    lands(game, "Wastes", 4);
    const memnite = toHand(game, "Memnite");
    a.chooseDiscardsFn = () => [memnite];
    activate(game, urza, 0);
    expect(zone(game, memnite)).toBe("graveyard");
    expect(tokensNamed(game, "Powerstone Token")).toBe(1);
    expect(tapped(game, tokens(game, "Powerstone Token")[0])).toBe(true);
    // A second artifact discard this turn: only once each turn.
    const second = toHand(game, "Ornithopter");
    a.chooseDiscardsFn = () => [second];
    game.state.objects[urza].tapped = false;
    activate(game, urza, 0);
    expect(zone(game, second)).toBe("graveyard");
    expect(tokensNamed(game, "Powerstone Token")).toBe(1);
  });

  it("doesn't trigger on a nonartifact discard", () => {
    const { game, a } = table();
    const urza = spawn(game, "Urza, Powerstone Prodigy");
    lands(game, "Wastes", 1);
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    activate(game, urza, 0);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(tokensNamed(game, "Powerstone Token")).toBe(0);
  });
});

describe("Fortified Beachhead", () => {
  it("enters tapped without a Soldier, untapped with one, and pumps only Soldiers", () => {
    const { game } = table();
    const first = enter(game, "Fortified Beachhead");
    expect(tapped(game, first)).toBe(true);
    const vanguard = spawn(game, "Elite Vanguard");
    const bears = spawn(game, "Grizzly Bears");
    const second = enter(game, "Fortified Beachhead");
    expect(tapped(game, second)).toBe(false);
    lands(game, "Wastes", 5);
    activate(game, second, 1);
    expect(pt(game, vanguard)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Recruitment Officer", () => {
  it("offers only creature cards with mana value 3 or less among the top four", () => {
    const { game, a } = table();
    const officer = spawn(game, "Recruitment Officer");
    lands(game, "Plains", 4);
    toLibrary(game, "Lightning Bolt");
    const wurm = toLibrary(game, "Craw Wurm");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    const seen = pickFromZone(a, bears);
    activate(game, officer, 0);
    expect(seen.offered).toEqual([bears]);
    expect(seen.offered).not.toContain(wurm);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, wurm)).toBe("library");
  });
});

describe("Rootwire Amalgam", () => {
  it("prototyped it's a green 2/3; sacrificed it makes a hasty Golem three times its last power", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const amalgam = toHand(game, "Rootwire Amalgam");
    expect(castOffers(game, amalgam).some((c) => c.prototype === true)).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card: amalgam, targets: [], prototype: true });
    settle(game);
    expect(pt(game, amalgam)).toEqual({ power: 2, toughness: 3 });
    expect([...game.characteristics(amalgam).colors]).toEqual(["G"]);
    game.state.objects[amalgam].summoningSick = false;
    activate(game, amalgam, 0);
    expect(zone(game, amalgam)).toBe("graveyard");
    const [golem] = tokens(game, "Golem Token (Rootwire Amalgam)");
    expect(pt(game, golem)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, golem).has("haste")).toBe(true);
    nextTurn(game);
    expect(keywords(game, golem).has("haste")).toBe(false);
  });
});

describe("Mishra, Excavation Prodigy", () => {
  it("adds {R}{R} once a turn when you discard artifact cards", () => {
    const { game, a } = table();
    const mishra = spawn(game, "Mishra, Excavation Prodigy");
    lands(game, "Wastes", 1);
    const memnite = toHand(game, "Memnite");
    a.chooseDiscardsFn = () => [memnite];
    activate(game, mishra, 0);
    expect(zone(game, memnite)).toBe("graveyard");
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R")).toHaveLength(2);
  });

  it("adds nothing for a nonartifact discard", () => {
    const { game, a } = table();
    const mishra = spawn(game, "Mishra, Excavation Prodigy");
    lands(game, "Wastes", 1);
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    activate(game, mishra, 0);
    expect(pool(game)).toBe(0);
  });
});

describe("No One Left Behind", () => {
  it("costs {3} less aimed at a creature card with mana value 3 or less", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "No One Left Behind"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("costs full price for a bigger creature card", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const wurm = toGraveyard(game, "Craw Wurm");
    expect(() => cast(game, toHand(game, "No One Left Behind"), { targets: [ref(wurm)] })).toThrow();
  });
});

describe("Loran, Disciple of History", () => {
  it("returns an artifact card as it or another legendary creature enters, not for a nonlegendary one", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const ornithopter = toGraveyard(game, "Ornithopter");
    pickFromZone(a, ring);
    a.chooseTargetsFn = (_v, _s, _specs, legal) => [legal[0].find((t) => t.kind === "object" && t.object === ring) ?? null];
    enter(game, "Loran, Disciple of History");
    expect(zone(game, ring)).toBe("hand");
    a.chooseTargetsFn = (_v, _s, _specs, legal) => [legal[0][0] ?? null];
    enter(game, "Grizzly Bears");
    expect(zone(game, ornithopter)).toBe("graveyard");
    enter(game, "Isamaru, Hound of Konda");
    expect(zone(game, ornithopter)).toBe("hand");
  });
});

describe("Fog of War", () => {
  it("gains a life per creature and stops combat damage only from creatures with power 3 or less", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm");
    spawn(game, "Hill Giant", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Fog of War"));
    expect(life(game, A)).toBe(23);
    attack(game, a, [bears, wurm]);
    expect(life(game, B)).toBe(14);
  });
});

describe("Gurgling Anointer", () => {
  it("grows on your second draw each turn", () => {
    const { game } = table();
    const anointer = spawn(game, "Gurgling Anointer");
    // Alice drew her first card this turn in her draw step: this is her second.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(counters(game, anointer)).toBe(1);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(counters(game, anointer)).toBe(1);
  });

  it("dying returns another creature card with mana value at most its power — never itself", () => {
    const { game, a } = table();
    const anointer = spawn(game, "Gurgling Anointer");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(anointer)]);
    const bears = toGraveyard(game, "Grizzly Bears");
    const memnite = toGraveyard(game, "Memnite");
    toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [bears]);
    destroy(game, anointer);
    // Power 3 as it died: the 2-drop and the 0-drop, not the 4-drop Giant, nor the Anointer
    // itself (mana value 3 — it would qualify but for "another").
    expect([...seen.offered[0]].sort()).toEqual([bears, memnite].sort());
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Kayla's Command", () => {
  it("makes a Construct and gives a creature chosen on resolution a counter and double strike", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    pickPermanents(a, bears);
    cast(game, toHand(game, "Kayla's Command"), { modes: [0, 1] });
    expect(tokensNamed(game, "Construct Token (Kayla's Command)")).toBe(1);
    const [construct] = tokens(game, "Construct Token (Kayla's Command)");
    expect(pt(game, construct)).toEqual({ power: 2, toughness: 2 });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("double-strike")).toBe(true);
  });

  it("fetches a basic Plains and gains 2 life", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    cast(game, toHand(game, "Kayla's Command"), { modes: [2, 3] });
    expect(zone(game, plains)).toBe("hand");
    expect(life(game, A)).toBe(22);
  });
});

describe("Harbin, Vanguard Aviator", () => {
  it("pumps and grants flying when five Soldiers attack, not four", () => {
    const { game, a } = table();
    const harbin = spawn(game, "Harbin, Vanguard Aviator");
    const soldiers = [harbin, ...Array.from({ length: 3 }, () => spawn(game, "Elite Vanguard"))];
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [...soldiers, bears]);
    expect(keywords(game, bears).has("flying")).toBe(false);
    nextTurn(game);
    nextTurn(game);
    const fifth = spawn(game, "Elite Vanguard");
    a.declareAttackersFn = () => [...soldiers, fifth].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Machine Over Matter", () => {
  it("costs {U} with an artifact creature, {1}{U} without", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const target = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Machine Over Matter");
    expect(canCast(game, spell)).toBe(false);
    spawn(game, "Memnite");
    cast(game, spell, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("hand");
  });
});

describe("Forging the Anchor", () => {
  it("takes any number of artifact cards from the top five", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const ring = toLibrary(game, "Sol Ring");
    toLibrary(game, "Grizzly Bears");
    const memnite = toLibrary(game, "Memnite");
    const seen = pickFromZone(a, ring, memnite);
    cast(game, toHand(game, "Forging the Anchor"));
    expect(seen.offered).toEqual(expect.arrayContaining([ring, memnite]));
    expect(seen.offered).toHaveLength(2);
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, memnite)).toBe("hand");
  });
});

describe("Sardian Cliffstomper", () => {
  it("gets +X/+0 only on your turn with four or more Mountains", () => {
    const { game } = table();
    const stomper = spawn(game, "Sardian Cliffstomper");
    lands(game, "Mountain", 3);
    expect(pt(game, stomper)).toEqual({ power: 0, toughness: 4 });
    lands(game, "Mountain", 2);
    expect(pt(game, stomper)).toEqual({ power: 5, toughness: 4 });
    nextTurn(game);
    expect(pt(game, stomper)).toEqual({ power: 0, toughness: 4 });
  });
});

describe("Rust Goliath", () => {
  it("prototyped it's a green 3/5 with reach and trample", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const goliath = toHand(game, "Rust Goliath");
    game.dispatch({ type: "cast-spell", player: A, card: goliath, targets: [], prototype: true });
    settle(game);
    expect(pt(game, goliath)).toEqual({ power: 3, toughness: 5 });
    expect([...game.characteristics(goliath).colors]).toEqual(["G"]);
    expect(keywords(game, goliath).has("reach")).toBe(true);
    expect(keywords(game, goliath).has("trample")).toBe(true);
  });
});

describe("Clay Revenant", () => {
  it("enters tapped and returns from the graveyard to hand", () => {
    const { game } = table();
    const revenant = enter(game, "Clay Revenant");
    expect(tapped(game, revenant)).toBe(true);
    const dead = toGraveyard(game, "Clay Revenant");
    lands(game, "Swamp", 3);
    activate(game, dead, 0);
    expect(zone(game, dead)).toBe("hand");
  });
});

describe("Wasteful Harvest", () => {
  it("mills five and may take a permanent card from among them", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Wasteful Harvest"));
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(graveyard(game).length).toBeGreaterThanOrEqual(4);
  });
});

describe("Mishra's Research Desk", () => {
  it("exiles the top two and lets you play the chosen one", () => {
    const { game, a } = table();
    const desk = spawn(game, "Mishra's Research Desk");
    lands(game, "Mountain", 2);
    const other = toLibrary(game, "Grizzly Bears");
    const bolt = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, bolt);
    activate(game, desk, 0);
    expect(zone(game, desk)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, other)).toBe("exile");
    expect(canCast(game, bolt)).toBe(true);
    expect(canCast(game, other)).toBe(false);
  });

  it("unearths from the graveyard", () => {
    const { game } = table();
    const desk = toGraveyard(game, "Mishra's Research Desk");
    lands(game, "Mountain", 2);
    activate(game, desk, 1);
    expect(zone(game, desk)).toBe("battlefield");
  });
});

describe("Pyrrhic Blast", () => {
  it("deals the sacrificed creature's power and draws a card", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const wurm = spawn(game, "Craw Wurm");
    const before = hand(game).length;
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: toHand(game, "Pyrrhic Blast"),
      targets: [ref(B)],
      sacrifice: wurm,
    });
    settle(game);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(life(game, B)).toBe(14);
    expect(hand(game).length).toBe(before + 1);
  });
});
