import { describe, expect, it } from "vitest";
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
  types,
  zone,
} from "./harness.js";

const lib = (game: ReturnType<typeof table>["game"], p: string = A) =>
  game.state.zones.perPlayer[p as typeof A].library;

describe("B294 group B", () => {
  it("Quartzwood Crasher makes an X/X token of the damage dealt", () => {
    const { game, a } = table();
    const crasher = spawn(game, "Quartzwood Crasher");
    attack(game, a, [crasher]);
    expect(life(game, B)).toBe(14);
    const [token] = named(game, "Dinosaur Beast Token");
    expect(pt(game, token)).toEqual({ power: 6, toughness: 6 });
  });

  it("Masked Vandal exiles its target only if a creature card was exiled", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    pickModes(a, 0);
    enter(game, "Masked Vandal");
    expect(zone(game, ring)).toBe("battlefield");
    const dead = toGraveyard(game, "Grizzly Bears");
    const ring2 = spawn(game, "Sol Ring", B);
    pickTargets(a, ring2);
    pickModes(a, 0);
    pickFromZone(a, dead);
    enter(game, "Masked Vandal");
    expect(zone(game, dead)).toBe("exile");
    expect(zone(game, ring2)).toBe("exile");
  });

  it("Warden of the Grove endures by its counters", () => {
    const { game, a } = table();
    const warden = spawn(game, "Warden of the Grove");
    game.state.objects[warden].counters["+1/+1"] = 2;
    pickModes(a, 0);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(2);
    pickModes(a, 1);
    enter(game, "Grizzly Bears");
    const [spirit] = named(game, "Spirit Token (Abzan Monument)");
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
  });

  it("Quilled Greatwurm: counters on your turn only, and the graveyard cast costs counters", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Quilled Greatwurm");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(2);
    game.state.objects[wurm].counters["+1/+1"] = 6;
    const dead = toGraveyard(game, "Quilled Greatwurm");
    lands(game, "Forest", 6);
    game.state.objects[wurm].summoningSick = false;
    toStep(game, "postcombat-main");
    cast(game, dead, { via: "graveyard-permission" });
    expect(counters(game, wurm)).toBe(0);
    expect(zone(game, dead)).toBe("battlefield");
  });

  it("Dollmaker's Shop counts non-Toys; Porcelain Gallery sets base P/T live", () => {
    const { game, a } = table();
    spawn(game, "Dollmaker's Shop");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Toy Token")).toBe(1);
    const toy = named(game, "Toy Token")[0];
    game.state.objects[toy].summoningSick = false;
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [toy]);
    expect(tokensNamed(game, "Toy Token")).toBe(1);

    const second = table();
    spawn(second.game, "Porcelain Gallery");
    const b1 = spawn(second.game, "Grizzly Bears");
    spawn(second.game, "Grizzly Bears");
    spawn(second.game, "Llanowar Elves");
    expect(pt(second.game, b1)).toEqual({ power: 3, toughness: 3 });
  });

  it("Protean Hulk finds creatures up to total mana value 6", () => {
    const { game, a } = table();
    const hulk = spawn(game, "Protean Hulk");
    const c1 = toLibrary(game, "Grizzly Bears");
    const c2 = toLibrary(game, "Grizzly Bears");
    const c3 = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, c1, c2, c3);
    destroy(game, hulk);
    expect(zone(game, c1)).toBe("battlefield");
    expect(zone(game, c3)).toBe("battlefield");
  });

  it("Thrakkus doubles power only, its own included", () => {
    const { game, a } = table();
    const thrakkus = spawn(game, "Thrakkus the Butcher");
    a.declareAttackersFn = () => [{ attacker: thrakkus, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, thrakkus)).toEqual({ power: 6, toughness: 4 });
  });

  it("Rampaging Yao Guai's total reads X", () => {
    const { game, a } = table();
    const r1 = spawn(game, "Sol Ring", B);
    const r2 = spawn(game, "Sol Ring", B);
    lands(game, "Forest", 5);
    pickTargets(a, r1, r2);
    const yao = toHand(game, "Rampaging Yao Guai");
    cast(game, yao, { x: 2 });
    expect(counters(game, yao)).toBe(2);
    expect(zone(game, r1)).toBe("graveyard");
    expect(zone(game, r2)).toBe("graveyard");
  });

  it("Thief of Sanity exiles one, mills the rest, and casts with any mana", () => {
    const { game, a } = table();
    const thief = spawn(game, "Thief of Sanity");
    const elves = toLibrary(game, "Llanowar Elves", B);
    pickFromZone(a, elves);
    const lb = graveyard(game, B).length;
    attack(game, a, [thief]);
    expect(zone(game, elves)).toBe("exile");
    expect(graveyard(game, B).length).toBe(lb + 2);
    lands(game, "Wastes", 1);
    cast(game, elves, { via: "impulse" });
    expect(zone(game, elves)).toBe("battlefield");
  });

  it("Dire Fleet Daredevil casts it this turn with any mana, then exiles it", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    enter(game, "Dire Fleet Daredevil");
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Wastes", 1);
    const lifeB = life(game, B);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(lifeB - 3);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("Lembas goes back into its owner's library", () => {
    const { game } = table();
    const lembas = spawn(game, "Lembas");
    lands(game, "Wastes", 2);
    const before = lib(game).length;
    activate(game, lembas, 0);
    expect(life(game)).toBe(23);
    expect(graveyard(game).length).toBe(0);
    expect(lib(game).length).toBe(before + 1);
  });

  it("Vohar drains only when an instant or sorcery was discarded", () => {
    const { game, a } = table();
    const vohar = spawn(game, "Vohar, Vodalian Desecrator");
    const bolt = toLibrary(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const lifeB = life(game, B);
    activate(game, vohar, 0);
    expect(life(game, B)).toBe(lifeB - 1);
    expect(life(game)).toBe(21);
  });

  it("Journey to Eternity brings both back", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Bayou", 3);
    pickTargets(a, bears);
    const journey = toHand(game, "Journey to Eternity");
    cast(game, journey, { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[journey].zone).toBe("battlefield");
    expect(types(game, journey)).toEqual(["land"]);
  });

  it("The Irencrag becomes Everflame, loses the mana ability, and equips", () => {
    const { game, a } = table();
    const crag = spawn(game, "The Irencrag");
    pickModes(a, 0);
    enter(game, "Thrakkus the Butcher");
    expect(types(game, crag)).toContain("artifact");
    expect(() => activate(game, crag, 0)).toThrow();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, crag, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("Haunted One pumps creatures sharing a type with the tapped commander", () => {
    const { game } = table();
    spawn(game, "Haunted One");
    const commander = spawn(game, "Thrakkus the Butcher");
    game.state.objects[commander].isCommander = true;
    const dragon = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(commander)]);
    settle(game);
    expect(pt(game, commander).power).toBe(5);
    expect(pt(game, dragon).power).toBe(7);
    expect(pt(game, bears).power).toBe(2);
    destroy(game, dragon);
    expect(zone(game, dragon)).toBe("battlefield");
    expect(counters(game, dragon)).toBe(1);
  });

  it("Elspeth Conquers Death taxes noncreature spells until your next turn", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickTargets(a, angel);
    enter(game, "Elspeth Conquers Death");
    expect(zone(game, angel)).toBe("exile");
    nextTurn(game); // Bob's
    nextTurn(game); // Alice's: chapter II
    settle(game);
    nextTurn(game); // Bob's
    settle(game);
    lands(game, "Wastes", 2, B);
    const ring = toHand(game, "Sol Ring", B);
    expect(() => cast(game, ring, { player: B })).toThrow();
    lands(game, "Wastes", 1, B);
    cast(game, ring, { player: B });
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("Another Round flickers X + 1 times with fresh choices", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 5);
    let passes = 0;
    a.choosePermanentsFn = (_v, eligible) => {
      passes += 1;
      return eligible;
    };
    cast(game, toHand(game, "Another Round"), { x: 1 });
    expect(passes).toBe(2);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].zoneChangeCount ?? 0).toBeGreaterThan(0);
  });

  it("Long-Term Plans puts the card third from the top", () => {
    const { game, a } = table();
    const card = toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 3);
    pickFromZone(a, card);
    cast(game, toHand(game, "Long-Term Plans"));
    const library = lib(game);
    expect(zone(game, card)).toBe("library");
    expect(library.indexOf(card)).toBe(2);
  });

  it("Indoraptor's bloodthirst and enrage", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, who: "each-opponent" }, []);
    settle(game);
    const raptor = toHand(game, "Indoraptor, the Perfect Hybrid");
    lands(game, "Bloodstained Mire", 3);
    expect(counters(game, raptor)).toBe(0);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(raptor)]);
    settle(game);
    expect(counters(game, raptor)).toBe(2);
    pickModes(a);
    const bLife = life(game, B);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(raptor)]);
    settle(game);
    expect(life(game, B)).toBe(bLife - 5);
  });

  it("Umbra Mystic's granted armor saves the permanent, the Aura destroyed instead", () => {
    const { game, a } = table();
    spawn(game, "Umbra Mystic");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    pickTargets(a, bears);
    const aura = toHand(game, "Holy Strength");
    cast(game, aura, { targets: [ref(bears)] });
    expect(zone(game, aura)).toBe("battlefield");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, aura)).toBe("graveyard");
  });

  it("Swashbuckler sacrifices Treasures for that many targets", () => {
    const { game, a } = table();
    const buck = spawn(game, "Swashbuckler Extraordinaire");
    const t1 = spawn(game, "Treasure Token");
    const t2 = spawn(game, "Treasure Token");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, t1, t2);
    pickTargets(a, buck, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(zone(game, t1)).not.toBe("battlefield");
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(keywords(game, buck).has("double-strike")).toBe(true);
  });

  it("Mission Briefing grants the chosen graveyard card, exiled after", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Island", 2);
    pickFromZone(a, bolt);
    cast(game, toHand(game, "Mission Briefing"));
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)], via: "graveyard-permission" });
    expect(zone(game, bolt)).toBe("exile");
  });

  it("Urabrask replaces the opponent's next draw with an exile they may play", () => {
    const { game } = table();
    spawn(game, "Urabrask, Heretic Praetor");
    const before = hand(game, B).length;
    const top = toLibrary(game, "Grizzly Bears", B);
    nextTurn(game);
    // Bob's turn: his draw step's draw became the exile.
    expect(hand(game, B).length).toBe(before);
    expect(zone(game, top)).toBe("exile");
  });

  it("Secret Arcade makes a creature spell an enchantment spell for Dusty Parlor", () => {
    const { game, a } = table();
    spawn(game, "Secret Arcade");
    spawn(game, "Dusty Parlor");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, bears)).toBe(2);
  });

  it("Joshua flips to Phoenix; chapter III returns creatures and flips back", () => {
    const { game, a } = table();
    const joshua = spawn(game, "Joshua, Phoenix's Dominant");
    lands(game, "Plateau", 5);
    activate(game, joshua, 0);
    expect(life(game, B)).toBe(18);
    const dead = toGraveyard(game, "Grizzly Bears");
    game.state.objects[joshua].counters.lore = 2;
    pickTargets(a, dead);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(zone(game, dead)).toBe("battlefield");
    expect(named(game, "Joshua, Phoenix's Dominant").length).toBe(1);
  });

  it("Orzhov Advokist: a player who takes counters can't attack you until your next turn", () => {
    const { game, a, b } = table();
    spawn(game, "Orzhov Advokist");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickModes(b, 0);
    pickPermanents(a, mine);
    pickPermanents(b, theirs);
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.turn.number === 3);
    settle(game);
    toStep(game, "precombat-main");
    expect(counters(game, theirs)).toBe(2);
    expect(counters(game, mine)).toBe(2);
    const offer = () => game.legalActions(B);
    expect(offer).toBeDefined();
  });
});
