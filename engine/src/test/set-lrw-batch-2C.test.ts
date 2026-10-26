/**
 * Lorwyn, batch 2 group C — the clause most likely to be wrong on each card:
 *
 * - Fodder Launch: the Goblin sacrifice, -5/-5, and 5 to the creature's controller.
 * - Elvish Eulogist: it counts itself once sacrificed (its ruling).
 * - Woodland Guidance: the clash untaps only your Forests; the spell is exiled.
 * - Veteran of the Depths: attacking taps it, and the counter is optional.
 * - Hearthcage Giant: sacrificing an Elemental pumps a Giant.
 * - Boggart Loggers: destroys a Forest (a land, not a creature).
 * - Springjack Knight: a won clash gives the target double strike.
 * - Sentry Oak: a won clash lets it attack (loses defender) with +2/+0.
 * - Scarred Vinebreeder: the Elf card exiled from the graveyard as the cost.
 * - Consuming Bonfire: an Elemental isn't a legal target for the 4-damage mode.
 * - Lowland Oaf: the Goblin is sacrificed at the next end step.
 * - Thorntooth Witch: a Treefolk spell gives +3/-3.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
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
  zone,
} from "./harness.js";

describe("Fodder Launch", () => {
  it("sacrifices a Goblin, shrinks the creature and hits its controller for 5", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const goblin = spawn(game, "Goblin Piker");
    const target = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Fodder Launch"), { targets: [ref(target)] });
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, target)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
  });

  it("can't be cast without a Goblin to sacrifice", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const target = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Fodder Launch"), { targets: [ref(target)] })).toThrow();
  });
});

describe("Elvish Eulogist", () => {
  it("gains 1 life per Elf card in the graveyard, itself included", () => {
    const { game } = table();
    toGraveyard(game, "Llanowar Elves");
    toGraveyard(game, "Grizzly Bears");
    const eulogist = spawn(game, "Elvish Eulogist");
    activate(game, eulogist);
    expect(life(game, A)).toBe(22);
  });
});

describe("Woodland Guidance", () => {
  it("returns the card, untaps your Forests on a win, and exiles itself", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 4);
    const theirForest = spawn(game, "Forest", B, { tapped: true });
    const card = toGraveyard(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    const guidance = toHand(game, "Woodland Guidance");
    cast(game, guidance, { targets: [ref(card)] });
    expect(zone(game, card)).toBe("hand");
    expect(forests.every((f) => game.state.objects[f].tapped !== true)).toBe(true);
    expect(game.state.objects[theirForest].tapped).toBe(true);
    expect(zone(game, guidance)).toBe("exile");
  });
});

describe("Veteran of the Depths", () => {
  it("takes a +1/+1 counter when attacking taps it", () => {
    const { game, a } = table();
    const vet = spawn(game, "Veteran of the Depths");
    pickModes(a, 0);
    attack(game, a, [vet]);
    expect(counters(game, vet)).toBe(1);
  });
});

describe("Hearthcage Giant", () => {
  it("makes two Elemental Shamans, and sacrificing one pumps a Giant +3/+1", () => {
    const { game } = table();
    const giant = enter(game, "Hearthcage Giant");
    expect(tokensNamed(game, "Elemental Shaman Token", A)).toBe(2);
    const token = Object.values(game.state.objects).find(
      (o) => o.zone === "battlefield" && o.cardName === "Elemental Shaman Token",
    )!;
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: giant,
      abilityIndex: 0,
      targets: [ref(giant)],
      sacrifice: token.id,
    });
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 8, toughness: 6 });
    expect(tokensNamed(game, "Elemental Shaman Token", A)).toBe(1);
  });
});

describe("Boggart Loggers", () => {
  it("destroys a target Forest", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const loggers = spawn(game, "Boggart Loggers");
    const forest = spawn(game, "Forest", B);
    activate(game, loggers, 0, { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, loggers)).toBe("graveyard");
  });
});

describe("Springjack Knight", () => {
  it("gives the target double strike when it wins the clash", () => {
    const { game, a } = table();
    const knight = spawn(game, "Springjack Knight");
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    pickTargets(a, knight);
    a.declareAttackersFn = () => [{ attacker: knight, defender: B }];
    toStep(game, "declare-blockers", A);
    settle(game);
    expect(keywords(game, knight).has("double-strike")).toBe(true);
  });
});

describe("Sentry Oak", () => {
  it("loses defender and gets +2/+0 on a won clash", () => {
    const { game, a } = table();
    const oak = spawn(game, "Sentry Oak");
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    pickModes(a, 0);
    toStep(game, "begin-combat", A);
    settle(game);
    expect(pt(game, oak)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, oak).has("defender")).toBe(false);
  });
});

describe("Scarred Vinebreeder", () => {
  it("exiles an Elf card from the graveyard to get +3/+3", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const elf = toGraveyard(game, "Llanowar Elves");
    const breeder = spawn(game, "Scarred Vinebreeder");
    activate(game, breeder);
    expect(zone(game, elf)).toBe("exile");
    expect(pt(game, breeder)).toEqual({ power: 4, toughness: 4 });
  });

  it("can't be activated with only non-Elf cards in the graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    toGraveyard(game, "Grizzly Bears");
    const breeder = spawn(game, "Scarred Vinebreeder");
    expect(() => activate(game, breeder)).toThrow();
    expect(graveyard(game, A).length).toBe(1);
  });
});

describe("Consuming Bonfire", () => {
  it("deals 7 to a Treefolk", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const tree = spawn(game, "Sentry Oak", B);
    cast(game, toHand(game, "Consuming Bonfire"), { modes: [1], targets: [ref(tree)] });
    expect(zone(game, tree)).toBe("graveyard");
  });

  it("can't aim the 4-damage mode at an Elemental", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const elemental = spawn(game, "Glarewielder", B);
    expect(() =>
      cast(game, toHand(game, "Consuming Bonfire"), { modes: [0], targets: [ref(elemental)] }),
    ).toThrow();
  });
});

describe("Lowland Oaf", () => {
  it("flings a Goblin: +1/+0 and flying, sacrificed at the next end step", () => {
    const { game } = table();
    const oaf = spawn(game, "Lowland Oaf");
    const goblin = spawn(game, "Goblin Piker");
    activate(game, oaf, 0, { targets: [ref(goblin)] });
    expect(pt(game, goblin).power).toBe(3);
    expect(keywords(game, goblin).has("flying")).toBe(true);
    toStep(game, "cleanup", A);
    expect(zone(game, goblin)).toBe("graveyard");
  });
});

describe("Thorntooth Witch", () => {
  it("gives a creature +3/-3 when you cast a Treefolk spell", () => {
    const { game, a } = table();
    spawn(game, "Thorntooth Witch");
    const target = spawn(game, "Hearthcage Giant", B);
    lands(game, "Plains", 5);
    pickTargets(a, target);
    pickModes(a, 0);
    cast(game, toHand(game, "Sentry Oak"));
    expect(pt(game, target)).toEqual({ power: 8, toughness: 2 });
  });
});
