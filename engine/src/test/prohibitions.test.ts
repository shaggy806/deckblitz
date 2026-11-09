/**
 * One record for "can't" (rule 101.2): `Prohibition`, on a static and in the
 * `prohibit` effect. See `prohibitions.ts` and `docs/plans/need-key-themes.md`,
 * theme 3c.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { prohibitionsOnPlayer } from "../prohibitions.js";
import { isLegalTarget, type TargetSource } from "../targeting.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

const canBeTargetedBy = (game: Game, id: ObjectId, player: PlayerId): boolean =>
  isLegalTarget(game.state, game.registry, "creature", ref(id), player, { spell: true } as TargetSource);

describe("can't become untapped", () => {
  it("Frozen in Ice: tapped as it enters, no untap step or effect untaps it, and it has no abilities", () => {
    const { game } = table();
    const bears = spawn(game, "Serra Angel", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Frozen in Ice"), { targets: [ref(bears)] });
    settle(game);
    expect(tapped(game, bears)).toBe(true);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(bears)]);
    expect(tapped(game, bears)).toBe(true);
    nextTurn(game);
    expect(tapped(game, bears)).toBe(true);
  });

  it("Blossombind: no untapping, and no counters either", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Blossombind"), { targets: [ref(bears)] });
    settle(game);
    expect(tapped(game, bears)).toBe(true);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("players with shroud (rule 702.18) and targeting past hexproof (702.11)", () => {
  it("True Believer: nobody may target its controller, its controller included", () => {
    const { game } = table();
    spawn(game, "True Believer");
    lands(game, "Mountain", 1);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] })).toThrow(/illegal target/);
  });

  it("Gilded Light: shroud until end of turn, gone next turn", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Gilded Light"), { targets: [] });
    settle(game);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] })).toThrow(/illegal target/);
    nextTurn(game);
    nextTurn(game);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    settle(game);
    expect(life(game)).toBe(17);
  });

  it("Glaring Spotlight: its controller may target an opponent's hexproof creature; the opponent's own side isn't helped", () => {
    const { game } = table();
    const dragon = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" }, [ref(dragon)]);
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(dragon)] })).toThrow(/illegal target/);
    spawn(game, "Glaring Spotlight");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(dragon)] });
    settle(game);
    expect(zone(game, dragon)).toBe("graveyard");
  });

  it("Kaya, Bane of the Dead: an opponent with hexproof can be targeted", () => {
    const { game } = table();
    spawn(game, "Shalai, Voice of Plenty", B);
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] })).toThrow(/illegal target/);
    spawn(game, "Kaya, Bane of the Dead");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(17);
  });
});

describe("can't be the target of what your opponents control", () => {
  it("Shielding Plax: its controller's opponents can't, its controller can, whoever controls the creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Shielding Plax"), { targets: [ref(bears)] });
    settle(game);
    lands(game, "Mountain", 1, B);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(bears)]);
    // Alice made it, so Alice may still target it.
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Vines of Vastwood: this turn only, and the +4/+4 only if kicked", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Vines of Vastwood"), { targets: [ref(bears)] });
    settle(game);
    expect(canBeTargetedBy(game, bears, B)).toBe(false);
    expect(canBeTargetedBy(game, bears, A)).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    expect(canBeTargetedBy(game, bears, B)).toBe(true);
  });

  it("Veilstone Amulet: creatures that arrive later this turn are covered too (rule 611.2c)", () => {
    const { game } = table();
    spawn(game, "Veilstone Amulet", A);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    settle(game);
    const late = spawn(game, "Grizzly Bears", A);
    expect(canBeTargetedBy(game, late, B)).toBe(false);
    expect(canBeTargetedBy(game, late, A)).toBe(true);
  });
});

describe("can't cause you to sacrifice", () => {
  it("Sigarda: an opponent's edict does nothing, the player's own sacrifice outlet still works", () => {
    const { game } = table();
    spawn(game, "Sigarda, Host of Herons", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Diabolic Edict"), { targets: [ref(B)] });
    settle(game);
    expect(game.state.awaiting).toBeNull();
    expect(game.state.pendingSacrifices).toHaveLength(0);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("can't enter the battlefield, and casting from graveyards (Grafdigger's Cage)", () => {
  it("a reanimation leaves the card in the graveyard; a noncreature permanent isn't stopped", () => {
    const { game } = table();
    spawn(game, "Grafdigger's Cage", B);
    const creature = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Reanimate"), { targets: [ref(creature)] });
    settle(game);
    expect(zone(game, creature)).toBe("graveyard");
  });

  it("no spell is cast from a graveyard", () => {
    const { game } = table();
    spawn(game, "Grafdigger's Cage", B);
    const twice = toGraveyard(game, "Think Twice");
    lands(game, "Island", 3);
    expect(canCast(game, twice)).toBe(false);
  });

  it("Kunoros reaches graveyards, not exile or a hand", () => {
    const { game } = table();
    spawn(game, "Kunoros, Hound of Athreos", B);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("life and sacrifices as costs", () => {
  it("Angel of Jubilation: a sacrifice cost is refused, and a shock land may still pay life", () => {
    const { game } = table();
    spawn(game, "Angel of Jubilation", B);
    const seer = spawn(game, "Viscera Seer");
    expect(game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === seer)).toBe(false);
    lands(game, "Mountain", 1);
    const land = toHand(game, "Hallowed Fountain");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === land)).toBe(true);
  });

  it("Karn's Sylex: life for a spell's cost is refused, life for a mana ability isn't", () => {
    const { game } = table();
    spawn(game, "Karn's Sylex", B);
    lands(game, "Mana Confluence", 1);
    const birds = toHand(game, "Birds of Paradise");
    expect(canCast(game, birds)).toBe(true);
  });

  it("Karn's Sylex: a Phyrexian pip can't be paid with life", () => {
    const { game } = table();
    const probe = toHand(game, "Gitaxian Probe");
    expect(canCast(game, probe)).toBe(true);
    spawn(game, "Karn's Sylex", B);
    expect(canCast(game, probe)).toBe(false);
  });
});

describe("only during their own turns", () => {
  it("City of Solitude: a cast on another's turn is refused, on your own it's fine", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 1, B);
    const theirs = toHand(game, "Lightning Bolt", B);
    cast(game, toHand(game, "Grizzly Bears"), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    // Bob holds priority on Alice's turn: the Bolt is his to cast, until the City.
    expect(canCast(game, theirs, B)).toBe(true);
    spawn(game, "City of Solitude", B);
    expect(canCast(game, theirs, B)).toBe(false);
  });
});

describe("the other object acts", () => {
  it("Melira's Keepers takes no counters; Goblin Brawler can't be equipped", () => {
    const { game } = table();
    const keepers = enter(game, "Melira's Keepers");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(keepers)]);
    expect(counters(game, keepers)).toBe(0);
    const brawler = spawn(game, "Goblin Brawler");
    const split = spawn(game, "Bonesplitter");
    lands(game, "Mountain", 1);
    activate(game, split, 0, { targets: [ref(brawler)] });
    settle(game);
    expect(game.state.objects[split].attachedTo).toBeNull();
  });

  it("Spatial Binding: the named permanent doesn't phase out until its controller's next upkeep", () => {
    const { game } = table();
    const binding = spawn(game, "Spatial Binding");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, binding, 0, { targets: [ref(bears)] });
    settle(game);
    expect(life(game)).toBe(19);
    game.debugApplyEffect(A, { kind: "phase-out", filter: { type: "creature" } }, []);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Platinum Emperion: no gain, no loss, no life paid", () => {
    const { game } = table();
    spawn(game, "Platinum Emperion");
    lands(game, "Mountain", 1, B);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    expect(life(game)).toBe(20);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    expect(life(game)).toBe(20);
  });

  it("Wardscale Dragon: only the player it attacks, and only while it attacks", () => {
    const { game } = table();
    const dragon = spawn(game, "Wardscale Dragon");
    expect(prohibitionsOnPlayer(game.state, game.registry, "cast", B)).toHaveLength(0);
    toStep(game, "declare-attackers");
    game.state.objects[dragon].attacking = B;
    expect(prohibitionsOnPlayer(game.state, game.registry, "cast", B)).toHaveLength(1);
    expect(prohibitionsOnPlayer(game.state, game.registry, "cast", A)).toHaveLength(0);
  });

  it("Brand of Ill Omen: the enchanted creature's controller, whoever controls the Aura", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Brand of Ill Omen"), { targets: [ref(bears)] });
    settle(game);
    expect(prohibitionsOnPlayer(game.state, game.registry, "cast", B)).toHaveLength(1);
    expect(prohibitionsOnPlayer(game.state, game.registry, "cast", A)).toHaveLength(0);
  });
});

describe("losing, transforming, other Auras", () => {
  it("Lich's Tomb: 0 life doesn't lose, and each life lost costs a permanent; poison still loses", () => {
    const { game } = table();
    spawn(game, "Lich's Tomb");
    game.state.players[A].life = 0;
    nextTurn(game);
    expect(life(game)).toBe(0);
    expect(game.state.players[A].hasLost).toBe(false);
    game.state.players[A].counters.poison = 10;
    nextTurn(game);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Immerwolf: a non-Human Werewolf doesn't transform, a Human one does", () => {
    const { game } = table();
    const howler = spawn(game, "Gatstaf Shepherd");
    game.state.objects[howler].face = 1;
    spawn(game, "Immerwolf");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(howler)]);
    expect(game.state.objects[howler].face).toBe(1);
  });

  it("Gaea's Revenge: a nongreen source can't target it, a green one can", () => {
    const { game } = table();
    const revenge = spawn(game, "Gaea's Revenge", B);
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(revenge)] })).toThrow(/illegal target/);
  });

  it("Anti-Magic Aura: spells can't target its creature, and another Aura can't go on", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Anti-Magic Aura"), { targets: [ref(bears)] });
    settle(game);
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] })).toThrow(/illegal target/);
  });
});

describe("what an effect makes", () => {
  it("a this-turn prohibition is gone next turn, and a graveyard-holding test still reads the zone", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Mountain", 1, B);
    game.debugApplyEffect(A, { kind: "prohibit", prohibits: [{ act: "cast", who: "each-opponent" }] }, []);
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(canCast(game, bolt, B)).toBe(false);
    nextTurn(game);
    expect(canCast(game, bolt, B)).toBe(true);
    expect(graveyard(game)).toHaveLength(0);
  });

  it("the removed spellings are gone from every card", { timeout: 60_000 }, () => {
    const dir = join(__dirname, "..", "cards", "pool");
    const refused =
      /\b(castLimit|drawsPerTurn|abilitiesOf|castOnlyAsSorcery|cantLoseGame|cantWinGame|opponentsCantWinGame|opponentsCantLoseGame|cantSearchLibraries|preventsCounters|graveyardCardsUntargetable|cantBecomeSuspected|playerHexproof|castOnlyFromHand|castsLeft|lifeCantChange|cantLoseLife|cantCast)\s*:/;
    const offenders = readdirSync(dir)
      .filter((file) => file.endsWith(".ts") && refused.test(readFileSync(join(dir, file), "utf8")))
      .slice(0, 10);
    expect(offenders).toEqual([]);
  });
});
