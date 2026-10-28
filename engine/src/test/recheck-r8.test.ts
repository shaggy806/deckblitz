/**
 * The need-keys recheck list R8 (batch B242): cards whose old blocker had
 * been built — each test pins the clause the old record doubted.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import { restrictionsOf } from "../characteristics.js";

describe("recheck R8", () => {
  it("Suplex: the creature dealt 3 damage is exiled instead of dying", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Suplex"), { modes: [0], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("Spikefield Hazard: a permanent dealt damage this way that would die is exiled", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const elves = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Spikefield Hazard"), { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("exile");
  });

  it("Plague Drone: an opponent's life gain becomes life loss", () => {
    const { game } = table();
    spawn(game, "Plague Drone");
    lands(game, "Plains", 2, B);
    game.state.priority.holder = B;
    cast(game, toHand(game, "Revitalize", B), { player: B });
    expect(life(game, B)).toBe(17);
  });

  it("Undergrowth Champion: two blockers' damage is one event, so one counter goes", () => {
    const { game, a } = table();
    const champion = spawn(game, "Undergrowth Champion");
    game.state.objects[champion].counters["+1/+1"] = 2;
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [champion]);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: one, attacker: champion }, { blocker: two, attacker: champion }] });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, champion)).toBe("battlefield");
    expect(counters(game, champion)).toBe(1);
  });

  it("Hungering Hydra: enters with X counters, gets that many more when dealt damage", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const hydra = toHand(game, "Hungering Hydra");
    cast(game, hydra, { x: 3 });
    expect(counters(game, hydra)).toBe(3);
    lands(game, "Mountain", 1, B);
    game.state.priority.holder = B;
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(hydra)] });
    expect(zone(game, hydra)).toBe("battlefield");
    expect(counters(game, hydra)).toBe(5);
  });

  it("Alpha Authority: the enchanted creature can be blocked by only one creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Alpha Authority"), { targets: [ref(bears)] });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [bears]);
    const two = named(game, "Grizzly Bears", B);
    const blocks = two.map((blocker) => ({ blocker, attacker: bears }));
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks })).not.toBeNull();
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: blocks.slice(0, 1) })).toBeNull();
  });

  it("Bat Colony: a Bat for each mana from a Cave spent to cast it", () => {
    const { game } = table();
    for (const cave of lands(game, "Hidden Cataract", 2)) game.state.objects[cave].tapped = false;
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Bat Colony"));
    expect(tokensNamed(game, "Bat Token", A)).toBe(2);
  });

  it("Cataclysmic Prospecting: a tapped Treasure for each mana from a Desert", () => {
    const { game } = table();
    for (const desert of lands(game, "Abraded Bluffs", 2)) game.state.objects[desert].tapped = false;
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Cataclysmic Prospecting"), { x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    const treasures = named(game, "Treasure Token", A);
    expect(treasures).toHaveLength(2);
    expect(treasures.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("Kalain: another creature enters with a counter per Treasure mana spent on it", () => {
    const { game } = table();
    spawn(game, "Kalain, Reclusive Painter");
    spawn(game, "Treasure Token");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(1);
    const elves = toHand(game, "Llanowar Elves");
    lands(game, "Forest", 1);
    cast(game, elves);
    expect(counters(game, elves)).toBe(0);
  });

  it("Coin of Mastery: a counter per mana from an artifact source", () => {
    const { game } = table();
    spawn(game, "Coin of Mastery");
    spawn(game, "Treasure Token");
    spawn(game, "Treasure Token");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(2);
  });

  it("Marut: a Treasure for each mana from a Treasure spent, none without", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    spawn(game, "Treasure Token");
    spawn(game, "Treasure Token");
    cast(game, toHand(game, "Marut"));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);

    const other = table();
    lands(other.game, "Wastes", 8);
    cast(other.game, toHand(other.game, "Marut"));
    expect(tokensNamed(other.game, "Treasure Token", A)).toBe(0);
  });

  it("Spoils of the Hunt: +1/+0 per Treasure mana, then damage equal to its power", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    spawn(game, "Treasure Token");
    spawn(game, "Treasure Token");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Spoils of the Hunt"), { targets: [ref(bears), ref(giant)] });
    expect(pt(game, bears).power).toBe(4);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });

  it("Chandra's Incinerator: costs less by opponents' noncombat damage, and redirects it", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    lands(game, "Mountain", 3);
    const incinerator = toHand(game, "Chandra's Incinerator");
    cast(game, incinerator);
    expect(zone(game, incinerator)).toBe("battlefield");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Thieves' Tools: unblockable while the equipped creature's power is 3 or less", () => {
    const { game, a } = table();
    const tools = spawn(game, "Thieves' Tools");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, tools, 0, { targets: [ref(bears)] });
    spawn(game, "Grizzly Bears", B);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
  });

  it("Thieves' Tools: a 4-power equipped creature can be blocked", () => {
    const { game, a } = table();
    const tools = spawn(game, "Thieves' Tools");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1;
    lands(game, "Wastes", 2);
    activate(game, tools, 0, { targets: [ref(giant)] });
    const blocker = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [giant]);
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker, attacker: giant }] })).toBeNull();
  });

  it("Glimmer Lens: draws when the equipped creature attacks with another, not alone", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Glimmer Lens"));
    const [rebel] = named(game, "Rebel Token", A);
    game.state.objects[rebel].summoningSick = false;
    const before = hand(game).length;
    attack(game, a, [rebel]);
    expect(hand(game)).toHaveLength(before);
    nextTurn(game);
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears");
    const drawn = hand(game).length;
    attack(game, a, [rebel, bears]);
    expect(hand(game)).toHaveLength(drawn + 1);
  });

  it("Varchild: the damaged player creates Survivors that can't block or attack you, and you take them all", () => {
    const { game, a } = table({ players: 3 });
    const varchild = spawn(game, "Varchild, Betrayer of Kjeldor");
    attack(game, a, [varchild]);
    const survivors = named(game, "Survivor Token", B);
    expect(survivors).toHaveLength(3);
    expect(survivors.every((id) => game.state.objects[id].owner === B)).toBe(true);
    expect(restrictionsOf(game.state, game.registry, survivors[0]).has("cant-block")).toBe(true);
    nextTurn(game);
    for (const id of survivors) game.state.objects[id].summoningSick = false;
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const at = (defender: typeof A) => [{ attacker: survivors[0], defender }];
    expect(game.canDispatch({ type: "declare-attackers", player: B, attackers: at(A) })).not.toBeNull();
    expect(game.canDispatch({ type: "declare-attackers", player: B, attackers: at(C) })).toBeNull();
    game.dispatch({ type: "declare-attackers", player: B, attackers: [] });
    toStep(game, "postcombat-main", B);
    lands(game, "Swamp", 3, B);
    cast(game, toHand(game, "Murder", B), { player: B, targets: [ref(varchild)] });
    expect(graveyard(game, A)).toContain(varchild);
    expect(survivors.every((id) => controller(game, id) === A)).toBe(true);
  });
});
